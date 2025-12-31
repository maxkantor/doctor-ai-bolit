# CDK Deployment Fix - Docker Error

## Problem

If you see this error:
```
Error: spawnSync docker ENOENT
ValidationError: Failed to bundle asset
```

This means CDK was trying to use Docker to bundle the Lambda function, but Docker is not installed or not running.

## Solution

The CDK stack has been updated to use **pre-built binaries** instead of Docker bundling. This means:

✅ **Docker is NOT required**  
✅ You just need to build the backend first

## Steps to Deploy

### 1. Build the Backend (REQUIRED)

```bash
cd backend
dotnet restore
dotnet publish -c Release -o bin/Release/net8.0
```

**Verify build succeeded:**
```bash
ls -la bin/Release/net8.0/DoctorAIBolit.Api.dll
# Should show the DLL file exists
```

### 2. Deploy with CDK

```bash
cd ../infrastructure/cdk
npm install
cdk bootstrap    # First time only
cdk deploy
```

## What Changed

The CDK stack now uses:
```typescript
code: lambda.Code.fromAsset(backendBuildPath)
```

Instead of:
```typescript
code: lambda.Code.fromAsset(backendPath, {
  bundling: { ... }  // This required Docker
})
```

## Verification

After building, you should see:
- `backend/bin/Release/net8.0/DoctorAIBolit.Api.dll` exists
- `backend/bin/Release/net8.0/` contains all required files

Then CDK deploy will work without Docker.

## Alternative: If You Want to Use Docker

If you prefer Docker bundling (not recommended for this setup):

1. Install Docker Desktop
2. Start Docker
3. Revert the CDK stack to use bundling (not recommended)

The pre-built binary approach is simpler and faster.

