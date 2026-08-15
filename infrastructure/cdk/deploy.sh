#!/bin/bash
# Deployment script for DoctorAIBolit CDK

set -e

echo "🚀 Building backend..."
cd "$(dirname "$0")/../../backend"
dotnet restore
# Publish to the exact path the CDK Lambda asset consumes (see doctoraibolit-stack.ts).
dotnet publish -c Release -r linux-x64 --self-contained false -o bin/Release/net10.0/linux-x64/publish

if [ ! -d "bin/Release/net10.0/linux-x64/publish" ]; then
  echo "❌ Error: Backend build failed or output directory not found"
  echo "Please ensure .NET 10 SDK is installed and build succeeds"
  exit 1
fi

echo "📦 Deploying CDK stack..."
cd "../infrastructure/cdk"
npm install
cdk deploy "$@"

echo "✅ Deployment complete!"


