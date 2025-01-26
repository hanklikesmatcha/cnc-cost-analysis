# Use Ubuntu as base image for better FreeCAD support
FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Python, FreeCAD and other dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    freecad \
    python3-pyside2.qtcore \
    python3-pyside2.qtgui \
    python3-numpy \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set Python path to include FreeCAD libraries
ENV PYTHONPATH=/usr/lib/freecad/lib:/usr/lib/python3/dist-packages:/app
ENV LD_LIBRARY_PATH=/usr/lib/freecad/lib:${LD_LIBRARY_PATH}

# Command to run the application
CMD ["python3", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"] 