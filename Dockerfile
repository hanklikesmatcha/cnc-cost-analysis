FROM node:18-alpine AS frontend-builder

WORKDIR /frontend
# Copy frontend files
COPY frontend/package*.json ./
# Install dependencies with increased memory for npm
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install
COPY frontend .

# Build with explicit error handling
RUN npm run build && echo "Build completed successfully" || \
    (echo "Standard build failed, trying force build..." && npm run build:force) || \
    (echo "Force build failed, trying skipcheck build..." && npm run build:skipcheck)

FROM ubuntu:22.04 AS base

ENV DEBIAN_FRONTEND=noninteractive
ENV FLASK_ENV=production
ENV FLASK_DEBUG=0

# Install all required packages in a single layer to reduce image size
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    bash \
    freecad \
    python3-pyside2.qtcore \
    python3-pyside2.qtgui \
    python3-numpy && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app

# Copy requirements first for better layer caching
COPY backend/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy only the application code
COPY backend/app app/

# Create and set permissions for required directories
RUN mkdir -p uploads converted static/assets && \
    chmod -R 755 uploads converted static

# Copy frontend build from the builder stage
COPY --from=frontend-builder /frontend/dist/ /app/static/

# Set Python path to include FreeCAD libraries
ENV PYTHONPATH=/usr/lib/freecad/lib:/usr/lib/python3/dist-packages:/app
ENV LD_LIBRARY_PATH=/usr/lib/freecad/lib:${LD_LIBRARY_PATH}

# Add health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/ || exit 1

EXPOSE 8000

# Default command (can be overridden by Railway)
CMD ["bash", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"] 