# Quick Start - CDK Deployment

## First Time Setup

1. **Install CDK globally** (if not already installed):
```bash
npm install -g aws-cdk
```

2. **Install dependencies**:
```bash
cd infrastructure/cdk
npm install
```

3. **Bootstrap CDK** (first time only, per account/region):
```bash
cdk bootstrap
```

## Deploy

**Option 1: Use the deployment script** (recommended):
```bash
./deploy.sh
```

**Option 2: Manual deployment**:
```bash
# Build backend
cd ../../backend
dotnet publish -c Release -o bin/Release/net8.0

# Deploy CDK
cd ../infrastructure/cdk
cdk deploy
```

## Common Commands

- `cdk synth` - Generate CloudFormation template
- `cdk diff` - Compare deployed stack with current state
- `cdk deploy` - Deploy this stack to your default AWS account/region
- `cdk destroy` - Destroy the stack (⚠️ deletes all resources)

## Before First Deployment

Make sure you have created the AWS Secrets Manager secret:

```bash
aws secretsmanager create-secret \
  --name doctoraibolit \
  --secret-string '{
    "ADMIN_SECRET": "your-admin-key",
    "OPENAI_API_KEY": "sk-your-openai-key",
    "STRIPE_SECRET_KEY": "sk_live_...",
    "STRIPE_WEBHOOK_SECRET": "whsec_...",
    "FROM_EMAIL": "noreply@doctoraibolit.com",
    "ADMIN_EMAIL": "admin@doctoraibolit.com"
  }'
```

## Troubleshooting

**Error: "Cannot find module"**
- Run `npm install` in the `infrastructure/cdk` directory

**Error: "CDK not bootstrapped"**
- Run `cdk bootstrap` first

**Error: "Lambda code not found"**
- Make sure you've built the backend: `cd backend && dotnet publish -c Release -o bin/Release/net8.0`

**Error: "Secret not found"**
- Create the `doctoraibolit` secret in AWS Secrets Manager (see above)


