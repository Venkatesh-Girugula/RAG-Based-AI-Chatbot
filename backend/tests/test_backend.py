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
@patch("backend.services.embedding_service.embedding_service.get_embedding")
@patch("backend.vectorstore.vector_store.vector_store.collection")
@patch("backend.services.llm_service.llm_service.generate_response")
def test_successful_retrieval(mock_generate, mock_collection, mock_get_embedding):
    # Mock query embedding
    mock_get_embedding.return_value = [0.1] * 768
    
    # Mock ChromaDB query return with high similarity (distance = 0.1, similarity = 0.9)
    mock_collection.query.return_value = {
        "ids": [["chunk_1"]],
        "distances": [[0.1]],
        "metadatas": [[{
            "title": "Corporate Security Policy - Data Classification",
            "source": "SecOps-Policy-2026.pdf",
            "chunk_id": "chunk_1"
        }]],
        "documents": [["Confidential data includes salaries and proprietary source code."]]
    }
    
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
    assert data["similarityScores"][0] == 0.9 # 1.0 - 0.1


# 2. Unknown Query / 5. Similarity Threshold Failure
@patch("backend.services.embedding_service.embedding_service.get_embedding")
@patch("backend.vectorstore.vector_store.vector_store.collection")
def test_similarity_threshold_failure(mock_collection, mock_get_embedding):
    mock_get_embedding.return_value = [0.1] * 768
    
    # Mock ChromaDB returning low similarity matches (distance = 0.4, similarity = 0.6)
    # Threshold is 0.75, so this chunk must be filtered out
    mock_collection.query.return_value = {
        "ids": [["chunk_x"]],
        "distances": [[0.4]],
        "metadatas": [[{
            "title": "React TypeScript Best Practices",
            "source": "Frontend-Standard-v2.md",
            "chunk_id": "chunk_x"
        }]],
        "documents": [["Never use any type."]]
    }

    payload = {
        "sessionId": "test_session_123",
        "message": "How do you cook pasta?"
    }

    response = client.post("/api/chat", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["reply"] == "I could not find enough information in the knowledge base to answer this question."
    assert data["retrievedChunks"] == 0
    assert data["similarityScores"] == [0.6]


# 3. Empty Query Handling
def test_empty_query():
    payload = {
        "sessionId": "test_session_123",
        "message": "   " # whitespace / empty
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422 # Pydantic min_length or FastAPI custom check


# 4. Invalid Session ID Handling
def test_invalid_session_id():
    payload = {
        "sessionId": "", # invalid / empty
        "message": "Hello Assistant"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422


# 6. Gemini Timeout Handling
@patch("backend.services.embedding_service.embedding_service.get_embedding")
@patch("backend.vectorstore.vector_store.vector_store.collection")
@patch("google.generativeai.GenerativeModel.generate_content")
def test_gemini_timeout(mock_generate, mock_collection, mock_get_embedding):
    mock_get_embedding.return_value = [0.1] * 768
    mock_collection.query.return_value = {
        "ids": [["chunk_1"]],
        "distances": [[0.1]],
        "metadatas": [[{"title": "Test Title", "source": "test.txt", "chunk_id": "c1"}]],
        "documents": [["Some grounded content."]]
    }
    
    # Mock a timeout error (raise Exception containing 'timeout')
    mock_generate.side_effect = Exception("Deadline Exceeded: Gemini API connection timeout occurred.")

    payload = {
        "sessionId": "test_session_123",
        "message": "Query document"
    }
    
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 504
    data = response.json()
    assert "timeout" in data["message"].lower()


# 7. Gemini Rate Limit Handling (429 Too Many Requests)
@patch("backend.services.embedding_service.embedding_service.get_embedding")
@patch("backend.vectorstore.vector_store.vector_store.collection")
@patch("google.generativeai.GenerativeModel.generate_content")
def test_gemini_rate_limit(mock_generate, mock_collection, mock_get_embedding):
    mock_get_embedding.return_value = [0.1] * 768
    mock_collection.query.return_value = {
        "ids": [["chunk_1"]],
        "distances": [[0.1]],
        "metadatas": [[{"title": "Test Title", "source": "test.txt", "chunk_id": "c1"}]],
        "documents": [["Grounded context info."]]
    }
    
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
@patch("backend.services.embedding_service.embedding_service.get_embedding")
@patch("backend.vectorstore.vector_store.vector_store.collection")
@patch("google.generativeai.GenerativeModel.generate_content")
def test_missing_api_key(mock_generate, mock_collection, mock_get_embedding):
    mock_get_embedding.return_value = [0.1] * 768
    mock_collection.query.return_value = {
        "ids": [["chunk_1"]],
        "distances": [[0.1]],
        "metadatas": [[{"title": "Test Title", "source": "test.txt", "chunk_id": "c1"}]],
        "documents": [["Valid corpus content."]]
    }
    
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
def test_corrupted_docs_json():
    # Attempt to seed documents with an invalid file path
    with pytest.raises(ValueError):
        # Pass a completely invalid JSON content or path
        vector_store.seed_documents("non_existent_file_path_999.json")


# 10. ChromaDB Failure Handling
@patch("backend.services.embedding_service.embedding_service.get_embedding")
@patch("backend.vectorstore.vector_store.vector_store.collection")
def test_chromadb_failure(mock_collection, mock_get_embedding):
    mock_get_embedding.return_value = [0.1] * 768
    
    # Mock collection query to throw an error (e.g. database corruption or process death)
    mock_collection.query.side_effect = Exception("ChromaDB connection refused or internal error.")

    payload = {
        "sessionId": "test_session_123",
        "message": "Database query"
    }
    
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 500
    data = response.json()
    assert "database" in data["message"].lower()
