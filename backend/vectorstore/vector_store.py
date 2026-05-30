import os
import json
import logging
from typing import List, Dict, Any, Tuple
import chromadb
from backend.config import settings
from backend.services.embedding_service import embedding_service

logger = logging.getLogger("app.vector_store")

class VectorStore:
    def __init__(self):
        self.client = None
        self.collection = None
        self._initialized = False

    def initialize(self):
        if self._initialized:
            return

        # Ensure persist directory exists
        persist_dir = settings.CHROMA_PERSIST_DIR
        os.makedirs(persist_dir, exist_ok=True)

        try:
            # Initialize persistent client
            self.client = chromadb.PersistentClient(path=persist_dir)
            
            # Create or get collection with cosine similarity configuration
            # Cosine distance is used internally; we convert distance to similarity.
            self.collection = self.client.get_or_create_collection(
                name="knowledge_base",
                metadata={"hnsw:space": "cosine"}
            )
            self._initialized = True
            logger.info("ChromaDB vector store initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise e

    def chunk_document(self, text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
        """
        Splits text into chunks of specified size and overlap.
        """
        if not text:
            return []
        
        # Simple character-based chunking with sliding window
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = min(start + chunk_size, text_len)
            chunks.append(text[start:end])
            if end == text_len:
                break
            start += (chunk_size - chunk_overlap)
            # Safeguard to prevent infinite loops if overlap >= size
            if chunk_size - chunk_overlap <= 0:
                start += chunk_size
                
        return chunks

    def seed_documents(self, docs_path: str):
        """
        Loads documents from docs.json, chunks them, generates embeddings,
        and indexes them in ChromaDB if the collection is empty.
        """
        self.initialize()
        
        # Check if the database already has documents indexed
        try:
            count = self.collection.count()
            if count > 0:
                logger.info(f"Vector store already contains {count} documents. Skipping seeding.")
                return
        except Exception as e:
            logger.warning(f"Could not retrieve document count: {e}. Attempting to seed anyway.")

        if not os.path.exists(docs_path):
            logger.error(f"Seeding source file {docs_path} does not exist.")
            return

        try:
            with open(docs_path, "r", encoding="utf-8") as f:
                documents = json.load(f)
        except Exception as e:
            logger.error(f"Corrupt or invalid docs.json structure: {e}")
            raise ValueError(f"Corrupted or invalid docs.json file: {e}")

        logger.info(f"Seeding {len(documents)} documents into ChromaDB...")
        
        chunk_size = settings.CHUNK_SIZE
        chunk_overlap = settings.CHUNK_OVERLAP

        all_ids = []
        all_embeddings = []
        all_metadatas = []
        all_documents = []

        for doc_idx, doc in enumerate(documents):
            title = doc.get("title", f"Doc {doc_idx}")
            content = doc.get("content", "")
            source = doc.get("source", "Unknown")

            if not content.strip():
                logger.warning(f"Document '{title}' is empty. Skipping.")
                continue

            chunks = self.chunk_document(content, chunk_size, chunk_overlap)
            
            for chunk_idx, chunk in enumerate(chunks):
                chunk_id = f"doc_{doc_idx}_chunk_{chunk_idx}"
                try:
                    embedding = embedding_service.get_embedding(chunk, task_type="retrieval_document")
                    
                    all_ids.append(chunk_id)
                    all_embeddings.append(embedding)
                    all_metadatas.append({
                        "title": title,
                        "chunk_id": chunk_id,
                        "source": source
                    })
                    all_documents.append(chunk)
                except Exception as e:
                    logger.error(f"Failed to generate embedding for chunk '{chunk_id}': {e}")
                    raise e

        if all_ids:
            try:
                self.collection.add(
                    ids=all_ids,
                    embeddings=all_embeddings,
                    metadatas=all_metadatas,
                    documents=all_documents
                )
                logger.info(f"Successfully seeded {len(all_ids)} document chunks into ChromaDB.")
            except Exception as e:
                logger.error(f"ChromaDB write transaction failed: {e}")
                raise e

    def query_similarity(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Executes a query by generating the query embedding, performing cosine search in ChromaDB,
        and converting distance back to cosine similarity score.
        """
        self.initialize()
        
        if not query_text or not query_text.strip():
            return []

        try:
            # Generate query embedding
            query_embedding = embedding_service.get_embedding(query_text, task_type="retrieval_query")
            
            # Query collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
            
            formatted_results = []
            
            # Ensure results have data
            if results and results["ids"] and results["ids"][0]:
                ids = results["ids"][0]
                distances = results["distances"][0]
                metadatas = results["metadatas"][0]
                documents = results["documents"][0]
                
                for idx in range(len(ids)):
                    # Cosine distance in ChromaDB is 1.0 - cosine_similarity.
                    # Hence, cosine_similarity = 1.0 - distance.
                    distance = distances[idx]
                    similarity = 1.0 - distance
                    
                    formatted_results.append({
                        "id": ids[idx],
                        "similarity": similarity,
                        "metadata": metadatas[idx],
                        "document": documents[idx]
                    })
            
            return formatted_results
        except Exception as e:
            logger.error(f"Vector search operation failed: {e}")
            raise e

vector_store = VectorStore()
