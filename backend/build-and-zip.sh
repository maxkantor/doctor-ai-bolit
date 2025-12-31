#!/bin/bash
set -e

echo "🔨 Building DoctorAIBolit backend..."

# Restore packages
echo "📦 Restoring packages..."
dotnet restore

# Build and publish
echo "🏗️  Building and publishing..."
dotnet publish -c Release -o bin/Release/net8.0

# Verify build
if [ ! -f "bin/Release/net8.0/DoctorAIBolit.Api.dll" ]; then
    echo "❌ Build failed! DoctorAIBolit.Api.dll not found."
    exit 1
fi

echo "✅ Build successful!"

# Create zip file in backend root
echo "📦 Creating backend.zip..."
cd bin/Release/net8.0
zip -r ../../../backend.zip . -q
cd ../../..

echo "✅ backend.zip created successfully in backend root!"
echo "📍 Location: $(pwd)/backend.zip"
ls -lh backend.zip

