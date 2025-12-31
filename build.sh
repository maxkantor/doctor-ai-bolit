#!/bin/bash
set -e

echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

echo "Checking if frontend directory exists:"
if [ -d "frontend" ]; then
  echo "Frontend directory found, changing to it..."
  cd frontend
  echo "Current directory: $(pwd)"
  echo "Installing dependencies..."
  npm install
  echo "Building..."
  npm run build
  echo "Build completed successfully!"
else
  echo "ERROR: frontend directory not found!"
  exit 1
fi

