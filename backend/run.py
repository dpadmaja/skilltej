#!/usr/bin/env python3
"""
Entry point for starting the Skilltej Certify backend server
"""

import os
import subprocess
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    print("=" * 60)
    print("Skilltej Certify - Backend Server")
    print("=" * 60)
    print()

    # Check if running on Windows
    if sys.platform == "win32":
        # Windows command
        cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
    else:
        # Unix/Mac command
        cmd = ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

    print("Starting server...")
    print("API will be available at: http://localhost:8000")
    print("Interactive API docs: http://localhost:8000/docs")
    print()
    print("Press Ctrl+C to stop the server")
    print()

    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)
    except FileNotFoundError:
        print("Error: uvicorn not found. Please install requirements:")
        print("pip install -r requirements.txt")
        sys.exit(1)
