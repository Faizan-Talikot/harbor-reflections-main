#!/bin/bash

# Upgrade pip first
pip install --upgrade pip

# Install dependencies with no cache to avoid issues
pip install --no-cache-dir -r requirements.txt

# Start the FastAPI server
uvicorn main:app --host 0.0.0.0 --port $PORT