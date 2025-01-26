from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
import logging
from pathlib import Path
from .geometry_analyzer import GeometryAnalyzer
from .cad_converter import CADConverter
from typing import Dict, Any
import time

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()
geometry_analyzer = GeometryAnalyzer()
converter = CADConverter()

# Log startup configuration
logger.info(f"Starting app with ENVIRONMENT: {os.getenv('FLASK_ENV', 'development')}")
logger.info(f"PORT: {os.getenv('PORT', '8000')}")
logger.info(f"Current working directory: {os.getcwd()}")

# Configure CORS based on environment
ENVIRONMENT = os.getenv("FLASK_ENV", "development")
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:8000",  # Local production server
    "https://*.railway.app",  # Railway default domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info("Application startup")
    logger.info(f"Static files will be served: {ENVIRONMENT == 'production'}")
    logger.info(f"Current directory contents: {os.listdir('.')}")


@app.get("/")
async def root():
    logger.debug("Root endpoint called")
    return {"status": "ok", "message": "CNC API is running"}


@app.get("/health")
@app.get("/api/health")
async def health_check():
    logger.debug("Health check endpoint called")
    try:
        # Check if we can access required directories
        logger.info(
            f"Checking directories - uploads: {os.path.exists('uploads')}, converted: {os.path.exists('converted')}, static: {os.path.exists('static')}"
        )
        return {"status": "healthy", "service": "backend"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "unhealthy", "error": str(e)}


# Mount static files only in production
if ENVIRONMENT == "production":
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Create directories if they don't exist
UPLOAD_DIR = Path("uploads")
CONVERTED_DIR = Path("converted")
UPLOAD_DIR.mkdir(exist_ok=True)
CONVERTED_DIR.mkdir(exist_ok=True)

# Store job statuses in memory (in production, use a database)
job_statuses: Dict[str, Dict[str, Any]] = {}


async def process_conversion(
    file_path: str, file_name: str, output_format: str, job_id: str
):
    try:
        # Analyze original file geometry
        geometry_data = geometry_analyzer.analyze_file(str(file_path))
        job_statuses[job_id] = {
            "status": "processing",
            "geometry": geometry_data,
        }

        # Generate output path
        output_filename = os.path.splitext(file_name)[0] + f".{output_format}"
        output_path = str(CONVERTED_DIR / output_filename)

        # Convert file using local converter
        success = converter.convert_file(file_path, output_path)

        if success:
            # Analyze converted file geometry
            converted_geometry = geometry_analyzer.analyze_file(output_path)
            job_statuses[job_id].update(
                {
                    "status": "completed",
                    "converted_file": output_path,
                    "converted_geometry": converted_geometry,
                }
            )
        else:
            job_statuses[job_id].update(
                {"status": "failed", "error": "Conversion failed"}
            )

    except Exception as e:
        job_statuses[job_id].update({"status": "failed", "error": str(e)})


@app.post("/api/upload")
async def upload_file(file: UploadFile, background_tasks: BackgroundTasks):
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in converter.supported_input_formats:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Supported types: {', '.join(converter.supported_input_formats)}",
        )

    try:
        # Save file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as f:
            contents = await file.read()
            f.write(contents)

        # Generate job ID
        job_id = f"job_{int(time.time())}"

        # Determine output format (convert to STL if input is not STL, otherwise to STEP)
        output_format = "stl" if file_ext != ".stl" else "step"

        # Start conversion in background
        background_tasks.add_task(
            process_conversion,
            str(file_path),
            file.filename,
            output_format,
            job_id,
        )

        return {
            "message": "File uploaded and conversion started",
            "filename": file.filename,
            "size": len(contents),
            "type": file_ext,
            "job_id": job_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/conversion/{job_id}")
async def check_conversion_status(job_id: str):
    if job_id not in job_statuses:
        return {"status": "not_found", "job_id": job_id}
    return job_statuses[job_id]


# Serve frontend static files only in production
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if ENVIRONMENT != "production":
        raise HTTPException(status_code=404, detail="Not found in development mode")

    static_path = "static"
    if not full_path or full_path == "index.html":
        return FileResponse(f"{static_path}/index.html")
    elif os.path.exists(f"{static_path}/{full_path}"):
        return FileResponse(f"{static_path}/{full_path}")
    else:
        return FileResponse(f"{static_path}/index.html")
