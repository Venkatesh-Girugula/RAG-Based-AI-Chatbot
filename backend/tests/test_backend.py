import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from google.api_core.exceptions import GoogleAPICallError, ResourceExhausted

from backend.main import app
from backend.config import settings
from backend.services.memory_service import memory_service
from backend.vectorstore.vector_store import vector_store

client = TestClient(app)

# --- FIXTURES ---

@pytest.fixture(autouse=True)
def clean_database():
    """
    Clears local sqlite session history before each test.
    """
    try:
        memory_service.clear_session("test_session_123")
        memory_service.clear_session("invalid_session")
    except Exception:
        pass

# --- TEST CASES ---

# 1. Successful Retrieval (and Grounded Response Generation)
@patch("backend.vectorstore.vector_store.vector_store.query_similarity")
@patch("backend.services.llm_service.llm_service.generate_response")
def test_successful_retrieval(mock_generate, mock_query_similarity):
    # Mock ChromaDB query return with high similarity (similarity = 0.9)
    mock_query_similarity.return_value = [{
        "id": "chunk_1",
        "similarity": 0.9,
        "metadata": {
            "title": "Corporate Security Policy - Data Classification",
            "source": "SecOps-Policy-2026.pdf",
            "chunk_id": "chunk_1"
        },
        "document": "Confidential data includes salaries and proprietary source code."
    }]
    
    # Mock Gemini response
    mock_generate.return_value = ("Salaries are classified as Confidential company data.", 45)

    payload = {
        "sessionId": "test_session_123",
        "message": "What is the classification of salary data?"
    }
    
    response = client.post("/api/chat", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "Salaries are classified" in data["reply"]
    assert data["tokensUsed"] == 45
    assert data["retrievedChunks"] == 1
    assert len(data["similarityScores"]) == 1
    assert data["similarityScores"][0] == 0.9


# 2. Unknown Query / 5. Similarity Threshold Failure
@patch("backend.vectorstore.vector_store.vector_store.query_similarity")
def test_similarity_threshold_failure(mock_query_similarity):
    # Mock ChromaDB returning low similarity matches (similarity = 0.2)
    # Threshold is 0.5 or 0.75, so this chunk must be filtered out
    mock_query_similarity.return_value = [{
        "id": "chunk_x",
        "similarity": 0.2,
        "metadata": {
            "title": "React TypeScript Best Practices",
            "source": "Frontend-Standard-v2.md",
            "chunk_id": "chunk_x"
        },
        "document": "Never use any type."
    }]

    payload = {
        "sessionId": "test_session_123",
        "message": "How do you cook pasta?"
    }

    response = client.post("/api/chat", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["reply"] == "I could not find enough information in the knowledge base to answer this question."
    assert data["retrievedChunks"] == 0
    assert data["similarityScores"] == [0.2]


# 3. Empty Query Handling
def test_empty_query():
    payload = {
        "sessionId": "test_session_123",
        "message": "   " # whitespace / empty
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400


# 4. Invalid Session ID Handling
def test_invalid_session_id():
    payload = {
        "sessionId": "", # invalid / empty
        "message": "Hello Assistant"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422


# 6. Gemini Timeout Handling
@patch("backend.vectorstore.vector_store.vector_store.query_similarity")
@patch("google.generativeai.GenerativeModel.generate_content")
def test_gemini_timeout(mock_generate, mock_query_similarity):
    mock_query_similarity.return_value = [{
        "id": "chunk_1",
        "similarity": 0.9,
        "metadata": {"title": "Test Title", "source": "test.txt", "chunk_id": "c1"},
        "document": "Some grounded content."
    }]
    
    # Mock a timeout error
    mock_generate.side_effect = Exception("Deadline Exceeded: Gemini API connection timeout occurred.")

    payload = {
        "sessionId": "test_session_123",
        "message": "Query document"
    }
    
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 504
    data = response.json()
    assert "timed out" in data["message"].lower() or "timeout" in data["message"].lower()


# 7. Gemini Rate Limit Handling (429 Too Many Requests)
@patch("backend.vectorstore.vector_store.vector_store.query_similarity")
@patch("google.generativeai.GenerativeModel.generate_content")
def test_gemini_rate_limit(mock_generate, mock_query_similarity):
    mock_query_similarity.return_value = [{
        "id": "chunk_1",
        "similarity": 0.9,
        "metadata": {"title": "Test Title", "source": "test.txt", "chunk_id": "c1"},
        "document": "Grounded context info."
    }]
    
    # Mock a Rate Limit / ResourceExhausted exception
    mock_generate.side_effect = Exception("ResourceExhausted: 429 Rate limit exceeded for model.")

    payload = {
        "sessionId": "test_session_123",
        "message": "Grounded search"
    }
    
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 429
    data = response.json()
    assert "rate limit" in data["message"].lower()


# 8. Missing API Key Exception Handling
@patch("backend.vectorstore.vector_store.vector_store.query_similarity")
@patch("google.generativeai.GenerativeModel.generate_content")
def test_missing_api_key(mock_generate, mock_query_similarity):
    mock_query_similarity.return_value = [{
        "id": "chunk_1",
        "similarity": 0.9,
        "metadata": {"title": "Test Title", "source": "test.txt", "chunk_id": "c1"},
        "document": "Valid corpus content."
    }]
    
    # Mock missing/invalid key error
    mock_generate.side_effect = Exception("API_KEY_INVALID: The request is missing a valid API key.")

    payload = {
        "sessionId": "test_session_123",
        "message": "Secure search query"
    }
    
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 503
    data = response.json()
    assert "api key" in data["message"].lower()


# 9. Corrupted docs.json Handling
@patch("backend.vectorstore.vector_store.vector_store.initialize")
@patch("backend.vectorstore.vector_store.vector_store.collection")
def test_corrupted_docs_json(mock_collection, mock_initialize, tmp_path):
    # Mock collection.count to return 0 to bypass seed skip check
    mock_collection.count.return_value = 0
    
    # Create temporary corrupted docs file
    corrupt_file = tmp_path / "corrupt_docs.json"
    corrupt_file.write_text("{invalid json...", encoding="utf-8")

    with pytest.raises(ValueError):
        vector_store.seed_documents(str(corrupt_file))


# 10. ChromaDB Failure Handling
@patch("backend.vectorstore.vector_store.vector_store.query_similarity")
def test_chromadb_failure(mock_query_similarity):
    # Mock collection query to throw an error
    mock_query_similarity.side_effect = Exception("ChromaDB connection refused or internal error.")

    payload = {
        "sessionId": "test_session_123",
        "message": "Database query"
    }
    
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 500
    data = response.json()
    assert "context" in data["message"].lower() or "search" in data["message"].lower()
