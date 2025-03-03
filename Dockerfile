FROM node:18-alpine AS frontend-builder

WORKDIR /frontend
# Copy frontend files
COPY frontend/package*.json ./
# Install dependencies with increased memory for npm
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install
COPY frontend .
# Create .env file with required variables for production build
RUN echo "VITE_API_URL=https://cnc-cost-analysis-production.up.railway.app" > .env && \
    echo "VITE_PUBLIC_POSTHOG_KEY=phc_iZWHQ6CzRbemZjXpJ6OT28rqIqq54fy8twQ4PqoAwvE" >> .env && \
    echo "VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com" >> .env
# Try different build approaches in sequence if earlier ones fail
RUN npm run build || npm run build:force || npm run build:skipcheck

FROM ubuntu:22.04 AS base

ENV DEBIAN_FRONTEND=noninteractive
ENV FLASK_ENV=production
ENV FLASK_DEBUG=0

# Split package installation into smaller steps with aggressive cleanup
# Install only essential Python first
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install bash separately
RUN apt-get update && \
    apt-get install -y --no-install-recommends bash && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install FreeCAD with minimal dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends --no-install-suggests freecad && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install remaining Python packages one by one
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3-pyside2.qtcore && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3-pyside2.qtgui && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3-numpy && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

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