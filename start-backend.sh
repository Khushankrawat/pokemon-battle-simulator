#!/bin/bash
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi
source venv/bin/activate
echo "Installing dependencies..."
pip install -r requirements.txt -q
echo "Starting backend server..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

