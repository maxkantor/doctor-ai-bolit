# Infrastructure

This directory contains deployment configuration files for DoctorAibolit.

## Backend Deployment

The backend can be deployed using AWS CDK, AWS SAM, or Serverless Framework.

### Option 1: AWS CDK (Recommended)

**Prerequisites:**
- Node.js 18+ and npm
- AWS CLI configured
- AWS CDK CLI installed: `npm install -g aws-cdk`
- .NET 8 SDK installed

**Deploy:**
```bash
cd infrastructure/cdk
./deploy.sh
```

Or manually:
```bash
cd backend
dotnet publish -c Release -o bin/Release/net8.0
cd ../infrastructure/cdk
npm install
cdk bootstrap  # First time only
cdk deploy
```

See `cdk/README.md` for more details.

### Option 2: AWS SAM

**Prerequisites:**
- AWS CLI configured
- AWS SAM CLI installed
- .NET 8 SDK installed

**Deploy:**
```powershell
.\deploy-sam.ps1
```

Or manually:
```powershell
cd backend
dotnet publish --configuration Release --output bin/Release/net8.0
cd ..\infrastructure
sam build
sam deploy --guided
```

### Option 3: Serverless Framework

**Prerequisites:**
- AWS CLI configured
- Serverless Framework installed: `npm install -g serverless`
- Serverless Framework account (free)
- .NET 8 SDK installed

**Deploy:**
```powershell
.\deploy.ps1
```

Or manually:
```powershell
cd backend
dotnet publish --configuration Release --output bin/Release/net8.0
cd ..\infrastructure
serverless deploy
```

## Frontend Deployment

The frontend is deployed to AWS Amplify.

### Prerequisites
- AWS Amplify console access
- Connect repository to Amplify

### Deploy Frontend
1. Connect your GitHub repository to AWS Amplify
2. Amplify will automatically detect `amplify.yml` and deploy

## AWS Secrets Manager

The application uses a secret named `doctoraibolit` with key/value pairs:
- `ADMIN_SECRET` - Admin authentication key
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

## DynamoDB Tables

The following tables are created automatically:
- Visitors
- ChatSessions
- ChatMessages
- ContactMessages
- PricingConfig
- PricingPlans
- VisitorSessions

## S3 Bucket

The OG images bucket (`doctoraibolit-og-images`) is created automatically with public read access.
