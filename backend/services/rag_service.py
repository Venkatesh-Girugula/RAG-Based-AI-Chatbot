import logging
from typing import List, Dict, Any
from backend.config import settings
from backend.vectorstore.vector_store import vector_store

logger = logging.getLogger("app.rag_service")

class RAGService:
    def retrieve_context(self, query: str) -> Dict[str, Any]:
        """
        Retrieves context chunks from ChromaDB, filters by threshold, and packages
        the results. Logs details about similarities and latencies.
        """
        if not query or not query.strip():
            return {
                "status": "empty_query",
                "context": "",
                "chunks": [],
                "scores": []
            }

        # Step 1: Perform the embedding query & search
        logger.info(f"Retrieving context for query: '{query}'")
        raw_results = vector_store.query_similarity(query, top_k=settings.TOP_K)
        
        # Log similarity scores
        raw_scores = [res["similarity"] for res in raw_results]
        logger.info(f"Retrieved {len(raw_results)} raw chunks. Similarity scores: {raw_scores}")

        # Step 2: Apply threshold filtering
        threshold = settings.SIMILARITY_THRESHOLD
        filtered_results = [res for res in raw_results if res["similarity"] >= threshold]
        filtered_scores = [res["similarity"] for res in filtered_results]

        logger.info(f"Filtered to {len(filtered_results)} chunks meeting threshold {threshold}. Scores: {filtered_scores}")

        # Step 3: Check if threshold was met
        if not filtered_results:
            logger.warning(f"No document chunk met the similarity threshold of {threshold}.")
            return {
                "status": "threshold_failed",
                "context": "",
                "chunks": [],
                "scores": raw_scores
            }

        # Step 4: Build context from retrieved chunks
        context_parts = []
        chunks_metadata = []
        for i, res in enumerate(filtered_results):
            meta = res["metadata"]
            doc_text = res["document"]
            title = meta.get("title", "Untitled")
            source = meta.get("source", "Unknown")
            
            context_parts.append(
                f"Document [{i+1}]: {title}\n"
                f"Source Reference: {source}\n"
                f"Content:\n{doc_text}\n"
                f"----------------------------------------"
            )
            
            chunks_metadata.append({
                "chunk_id": meta.get("chunk_id", f"unknown_chunk_{i}"),
                "title": title,
                "source": source,
                "score": res["similarity"]
            })

        full_context = "\n".join(context_parts)
        
        return {
            "status": "success",
            "context": full_context,
            "chunks": chunks_metadata,
            "scores": filtered_scores
        }

rag_service = RAGService()
