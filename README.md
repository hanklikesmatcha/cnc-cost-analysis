# FastAPI + React Project

This project consists of a FastAPI backend and React frontend, containerized with Docker for easy development and deployment.

## Development Setup

1. Install Docker and Docker Compose on your system.

2. Clone the repository and navigate to the project directory.

3. Start the development environment:
```bash
docker-compose up --build
```

The services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Debugging

### Backend Debugging
The backend service is configured with debugpy and exposes port 5678 for debugging. To connect:

1. In VS Code, add this configuration to `.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Remote Attach",
            "type": "python",
            "request": "attach",
            "connect": {
                "host": "localhost",
                "port": 5678
            },
            "pathMappings": [
                {
                    "localRoot": "${workspaceFolder}/backend",
                    "remoteRoot": "/app"
                }
            ]
        }
    ]
}
```

2. Start the services with `docker-compose up`
3. Use VS Code's Run and Debug view to attach to the debugger

### Frontend Debugging
The frontend development server includes source maps and can be debugged directly in your browser's DevTools. 