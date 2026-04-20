@echo off
REM Quick Start Script for Skilltej Certify on Windows

echo.
echo ====================================================
echo   Skilltej Certify - Quick Start
echo ====================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if PostgreSQL is running
echo.
echo Checking PostgreSQL connection...
psql -U postgres -d postgres -c "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo WARNING: PostgreSQL doesn't seem to be running
    echo Please start PostgreSQL and create a database named 'skilltej_certify'
    echo.
    pause
)

REM Start Backend
echo.
echo Starting Backend Server...
echo To start: cd backend ^&^& python run.py
echo.

REM Start Frontend
echo Starting Frontend Development Server...
echo To start: cd frontend ^&^& npm install ^&^& npm run dev
echo.

echo ====================================================
echo Setup Instructions:
echo 1. Open Command Prompt and navigate to backend folder
echo 2. Run: python run.py
echo 3. Open another Command Prompt and navigate to frontend folder
echo 4. Run: npm install (first time only)
echo 5. Run: npm run dev
echo 6. Open http://localhost:3000 in your browser
echo ====================================================
echo.

pause
