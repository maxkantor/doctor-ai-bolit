#!/bin/bash
# Deployment script for DoctorAIBolit CDK

set -e

echo "🚀 Building backend..."
cd "$(dirname "$0")/../../backend"
dotnet restore
dotnet publish -c Release -o bin/Release/net8.0

if [ ! -d "bin/Release/net8.0" ]; then
  echo "❌ Error: Backend build failed or output directory not found"
  echo "Please ensure .NET 8 SDK is installed and build succeeds"
  exit 1
fi

echo "📦 Deploying CDK stack..."
cd "../infrastructure/cdk"
npm install
cdk deploy "$@"

echo "✅ Deployment complete!"


