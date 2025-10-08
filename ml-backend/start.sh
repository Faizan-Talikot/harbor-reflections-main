#!/bin/bash

# Install dependencies
pip install --no-cache-dir -r requirements.txt

# Start the FastAPI server
uvicorn main:app --host 0.0.0.0 --port $PORT