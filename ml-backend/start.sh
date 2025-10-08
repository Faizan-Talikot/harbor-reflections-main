#!/bin/bash

# Ensure we're using the correct Python version
python --version

# Upgrade pip to latest version
pip install --upgrade pip

# Install wheel first to help with compilation
pip install wheel

# Install dependencies one by one to isolate any issues
pip install --no-cache-dir numpy==1.24.3
pip install --no-cache-dir pandas==1.5.3
pip install --no-cache-dir scikit-learn==1.2.2
pip install --no-cache-dir joblib==1.2.0
pip install --no-cache-dir fastapi==0.104.1
pip install --no-cache-dir "uvicorn[standard]==0.24.0"
pip install --no-cache-dir pydantic==2.5.0
pip install --no-cache-dir python-multipart==0.0.6

# Verify installations
python -c "import sklearn; print('scikit-learn version:', sklearn.__version__)"
python -c "import pandas; print('pandas version:', pandas.__version__)"

# Start the FastAPI server
uvicorn main:app --host 0.0.0.0 --port $PORT