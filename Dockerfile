# Multi-stage build for optimal image size
FROM python:3.10-slim AS builder

WORKDIR /app

# Install compilation essentials (required for some C-based libraries like ChromaDB/hnswlib)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .

# Install dependencies to a local folder for caching
RUN pip install --no-cache-dir --user -r requirements.txt

# --- PRODUCTION RUNNER IMAGE ---
FROM python:3.10-slim AS runner

WORKDIR /app

# Copy installed pip packages from builder stage
COPY --from=builder /root/.local /root/.local
COPY backend/ /app/backend/

# Update path to locate installed user packages
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

# Expose FastAPI default port
EXPOSE 8000

# Set up storage mounts directories for SQLite / Chroma persistence
RUN mkdir -p /app/backend/data/chromadb

# Healthcheck configuration (observability best practice)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Launch production server via Uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
