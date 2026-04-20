#!/bin/bash
# Quick Start Script for Skilltej Certify on macOS/Linux

echo ""
echo "===================================================="
echo "  Skilltej Certify - Quick Start"
echo "===================================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if PostgreSQL is running
echo ""
echo "Checking PostgreSQL connection..."
psql -U postgres -d postgres -c "SELECT 1" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "WARNING: PostgreSQL doesn't seem to be running"
    echo "Please start PostgreSQL and create a database named 'skilltej_certify'"
    echo ""
fi

echo ""
echo "===================================================="
echo "Setup Instructions:"
echo "===================================================="
echo ""
echo "1. Backend Setup:"
echo "   cd backend"
echo "   python3 -m venv venv"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   pip install -r requirements.txt"
echo "   python run.py"
echo ""
echo "2. Frontend Setup (in new terminal):"
echo "   cd frontend"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "3. Visit http://localhost:3000 in your browser"
echo ""
echo "4. Seed data (in new terminal):"
echo "   curl -X POST http://localhost:8000/api/admin/seed-data"
echo ""
echo "===================================================="
echo ""
