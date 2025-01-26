FROM node:18-alpine AS frontend-builder

WORKDIR /frontend
# Copy frontend files
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV FLASK_ENV=production
ENV FLASK_DEBUG=0

# Install Python, FreeCAD and other dependencies with optimized layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    freecad \
    python3-pyside2.qtcore \
    python3-pyside2.qtgui \
    python3-numpy \
    python3-iges \
    bash \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first
COPY backend/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy only the application code
COPY backend/app app/

# Create and set permissions for required directories
RUN mkdir -p uploads converted static/assets && \
    chmod -R 777 uploads converted static

# Copy frontend build from the builder stage
COPY --from=frontend-builder /frontend/dist/ /app/static/

# Set Python path to include FreeCAD libraries
ENV PYTHONPATH=/usr/lib/freecad/lib:/usr/lib/python3/dist-packages:/app
ENV LD_LIBRARY_PATH=/usr/lib/freecad/lib:${LD_LIBRARY_PATH}

EXPOSE 8000

# Default command (can be overridden by Railway)
CMD ["bash", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"] 