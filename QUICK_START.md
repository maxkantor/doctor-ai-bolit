# DoctorAIBolit - Quick Start Guide

## Prerequisites Checklist

- [ ] AWS Account created
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] .NET 8 SDK installed (`dotnet --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] CDK CLI installed (`npm install -g aws-cdk`)

## 5-Minute Setup

### 1. Create AWS Secret (2 minutes)

```bash
aws secretsmanager create-secret \
  --name doctoraibolit \
  --secret-string '{
    "ADMIN_SECRET": "your-strong-password-here",
    "OPENAI_API_KEY": "sk-your-openai-key",
    "STRIPE_SECRET_KEY": "sk_live_your_key",
    "STRIPE_WEBHOOK_SECRET": "whsec_your_secret",
    "FROM_EMAIL": "noreply@doctoraibolit.com",
    "ADMIN_EMAIL": "admin@doctoraibolit.com"
  }'
```

### 2. Build Backend (1 minute) - REQUIRED

**Important:** You MUST build the backend first. Docker is NOT required.

```bash
cd backend
dotnet restore
dotnet publish -c Release -o bin/Release/net8.0
cd ..
```

Verify build:
```bash
ls backend/bin/Release/net8.0/DoctorAIBolit.Api.dll
```

### 3. Deploy with CDK (2 minutes)

```bash
cd infrastructure/cdk
npm install
cdk bootstrap    # First time only
cdk deploy
```

### 4. Get API URL

After deployment, CDK outputs the API URL. Save it for frontend configuration.

---

## Common Commands

### CDK Commands
```bash
cd infrastructure/cdk
cdk synth          # Preview CloudFormation template
cdk diff           # See what will change
cdk deploy         # Deploy to AWS
cdk destroy        # Remove everything
cdk list           # List all stacks
```

### AWS CLI Commands
```bash
# Check deployment
aws cloudformation describe-stacks --stack-name DoctorAibolitStack

# View logs
aws logs tail /aws/lambda/DoctorAibolitApi --follow

# List tables
aws dynamodb list-tables

# Update secret
aws secretsmanager update-secret \
  --secret-id doctoraibolit \
  --secret-string file://secret.json
```

### Backend Commands
```bash
cd backend
dotnet restore
dotnet build
dotnet publish -c Release -o bin/Release/net8.0
```

### Frontend Commands
```bash
cd frontend
npm install
npm run dev        # Local development
npm run build      # Production build
```

---

## Troubleshooting Quick Fixes

**CDK: "Toolkit stack not found"**
```bash
cdk bootstrap
```

**CDK: "Cannot find module"**
```bash
cd infrastructure/cdk && npm install
```

**Lambda: "Code not found" or "Docker ENOENT"**
```bash
# Build backend first (Docker NOT required)
cd backend
dotnet restore
dotnet publish -c Release -o bin/Release/net8.0
# Verify: ls bin/Release/net8.0/DoctorAIBolit.Api.dll
```

**API: 403 Forbidden**
- Check CORS settings
- Verify API Gateway is deployed
- Check Lambda permissions

**API: 500 Error**
```bash
aws logs tail /aws/lambda/DoctorAibolitApi --follow
```

---

## Next Steps

1. ✅ Deploy backend (CDK)
2. ✅ Get API URL from CDK outputs
3. ✅ Deploy frontend (Amplify)
4. ✅ Set `VITE_API_URL` in Amplify environment variables
5. ✅ Configure Stripe webhook
6. ✅ Verify SES emails
7. ✅ Upload default OG image to S3

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

