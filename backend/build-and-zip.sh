#!/bin/bash
set -e

echo "🔨 Building DoctorAIBolit backend..."

# Restore packages
echo "📦 Restoring packages..."
dotnet restore

# Build and publish for Linux x64 (Lambda requirement)
echo "🏗️  Building and publishing for Linux x64..."
dotnet publish -c Release -r linux-x64 -o bin/Release/net10.0/linux-x64

# Verify build
if [ ! -f "bin/Release/net10.0/linux-x64/DoctorAIBolit.Api.dll" ]; then
    echo "❌ Build failed! DoctorAIBolit.Api.dll not found."
    exit 1
fi

echo "✅ Build successful!"

# Create zip file in backend root
echo "📦 Creating backend.zip..."
cd bin/Release/net10.0/linux-x64
zip -r ../../../../backend.zip . -q
cd ../../../../..

echo "✅ backend.zip created successfully in backend root!"
echo "📍 Location: $(pwd)/backend.zip"
ls -lh backend.zip

