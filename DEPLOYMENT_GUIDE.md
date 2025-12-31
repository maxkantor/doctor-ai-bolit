# DoctorAIBolit - Complete Deployment Guide

This guide provides step-by-step instructions for deploying DoctorAIBolit to AWS using CDK, SAM, or Serverless Framework.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Account Setup](#aws-account-setup)
3. [AWS Secrets Manager Configuration](#aws-secrets-manager-configuration)
4. [Deployment Methods](#deployment-methods)
   - [Option 1: AWS CDK (Recommended)](#option-1-aws-cdk-recommended)
   - [Option 2: AWS SAM](#option-2-aws-sam)
   - [Option 3: Serverless Framework](#option-3-serverless-framework)
5. [Frontend Deployment](#frontend-deployment)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Verification & Testing](#verification--testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **AWS Account**
   - Sign up at https://aws.amazon.com
   - Have a credit card ready (free tier available)

2. **AWS CLI**
   ```bash
   # macOS/Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install

   # Or using Homebrew (macOS)
   brew install awscli

   # Windows
   # Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
   ```

3. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter your:
   # - AWS Access Key ID
   # - AWS Secret Access Key
   # - Default region (e.g., us-east-1)
   # - Default output format (json)
   ```

4. **.NET 8 SDK**
   ```bash
   # macOS/Linux
   # Download from: https://dotnet.microsoft.com/download/dotnet/8.0

   # macOS (Homebrew)
   brew install --cask dotnet-sdk

   # Verify installation
   dotnet --version  # Should show 8.x.x
   ```

5. **Node.js 18+ and npm**
   ```bash
   # macOS (Homebrew)
   brew install node

   # Verify installation
   node --version  # Should show v18.x.x or higher
   npm --version
   ```

---

## AWS Account Setup

### 1. Create IAM User (Recommended)

For security, create a dedicated IAM user instead of using root credentials:

1. Go to AWS Console → IAM → Users
2. Click "Add users"
3. Username: `doctoraibolit-deploy`
4. Select "Provide user access to the management console" (optional) or "Access key - Programmatic access"
5. Attach policies:
   - `AdministratorAccess` (for initial setup)
   - Or create custom policy with required permissions (see below)
6. Save the Access Key ID and Secret Access Key
7. Configure AWS CLI with these credentials:
   ```bash
   aws configure --profile doctoraibolit
   ```

### 2. Required AWS Permissions

Minimum permissions needed:
- Lambda (create, update, delete functions)
- API Gateway (create, update, delete APIs)
- DynamoDB (create, update, delete tables)
- S3 (create, update, delete buckets)
- Secrets Manager (read secrets)
- SES (send emails)
- IAM (create roles for Lambda)
- CloudFormation (for CDK/SAM deployments)
- CloudWatch (logs)

---

## AWS Secrets Manager Configuration

### Step 1: Create the Secret

The application requires a secret named `doctoraibolit` with the following keys:

```bash
aws secretsmanager create-secret \
  --name doctoraibolit \
  --description "DoctorAIBolit application secrets" \
  --secret-string '{
    "ADMIN_SECRET": "your-strong-admin-password-here",
    "OPENAI_API_KEY": "sk-your-openai-api-key",
    "STRIPE_SECRET_KEY": "sk_live_your_stripe_secret_key",
    "STRIPE_WEBHOOK_SECRET": "whsec_your_webhook_signing_secret",
    "FROM_EMAIL": "noreply@doctoraibolit.com",
    "ADMIN_EMAIL": "admin@doctoraibolit.com"
  }' \
  --region us-east-1
```

### Step 2: Get Your Keys

**OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy the key (starts with `sk-`)

**Stripe Keys:**
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your "Secret key" (starts with `sk_live_` or `sk_test_`)
3. For webhook secret:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-api-url/api/stripe/webhook`
   - Copy the "Signing secret" (starts with `whsec_`)

**Admin Secret:**
- Generate a strong random password (at least 32 characters)
- Example: `openssl rand -base64 32`

### Step 3: Update Secret (if needed)

```bash
aws secretsmanager update-secret \
  --secret-id doctoraibolit \
  --secret-string '{
    "ADMIN_SECRET": "new-admin-secret",
    "OPENAI_API_KEY": "sk-new-key",
    "STRIPE_SECRET_KEY": "sk_live_new_key",
    "STRIPE_WEBHOOK_SECRET": "whsec_new_secret",
    "FROM_EMAIL": "noreply@doctoraibolit.com",
    "ADMIN_EMAIL": "admin@doctoraibolit.com"
  }' \
  --region us-east-1
```

### Step 4: Verify Secret

```bash
aws secretsmanager get-secret-value \
  --secret-id doctoraibolit \
  --region us-east-1 \
  --query SecretString \
  --output text
```

---

## Deployment Methods

## Option 1: AWS CDK (Recommended)

### Step 1: Install CDK CLI

```bash
npm install -g aws-cdk
cdk --version  # Verify installation
```

### Step 2: Build Backend (REQUIRED)

**Important:** CDK uses pre-built binaries, so you MUST build the backend first. Docker is NOT required.

```bash
cd backend
dotnet restore
dotnet publish -c Release -o bin/Release/net8.0
cd ..
```

**Verify build succeeded:**
```bash
ls -la backend/bin/Release/net8.0/DoctorAIBolit.Api.dll
# Should show the DLL file exists
```

### Step 3: Install CDK Dependencies

```bash
cd infrastructure/cdk
npm install
```

### Step 4: Bootstrap CDK (First Time Only)

CDK needs to bootstrap your AWS account to create resources for deployments:

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION

# Example:
cdk bootstrap aws://123456789012/us-east-1

# Or use your default account/region:
cdk bootstrap
```

**What this does:**
- Creates an S3 bucket for CDK assets
- Creates IAM roles for deployments
- Sets up CloudFormation for CDK stacks

### Step 5: Review Changes

Before deploying, review what will be created:

```bash
cdk synth  # Generates CloudFormation template
cdk diff   # Shows differences from current state
```

### Step 6: Deploy

**Option A: Use the deployment script**
```bash
./deploy.sh
```

**Option B: Manual deployment**
```bash
cdk deploy
```

**During deployment:**
- CDK will ask for confirmation
- Review the IAM changes (CDK needs permissions to create resources)
- Type `y` to approve

### Step 7: Get Outputs

After deployment, CDK will output:
- API URL (API Gateway endpoint)
- Lambda Function ARN
- S3 Bucket Name

Save the API URL - you'll need it for frontend configuration.

### Step 8: Update Frontend

Update `frontend/.env` or set environment variable in Amplify:
```
VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

---

## Option 2: AWS SAM

### Step 1: Install SAM CLI

```bash
# macOS
brew install aws-sam-cli

# Linux
pip install aws-sam-cli

# Windows
# Download from: https://github.com/aws/aws-sam-cli/releases
```

### Step 2: Build Backend

```bash
cd backend
dotnet publish -c Release -o bin/Release/net8.0
cd ..
```

### Step 3: Build SAM Application

```bash
cd infrastructure
sam build
```

### Step 4: Deploy

```bash
# Guided deployment (first time)
sam deploy --guided

# You'll be prompted for:
# - Stack Name: DoctorAibolitStack
# - AWS Region: us-east-1
# - Confirm changes: Y
# - Allow SAM CLI IAM role creation: Y
# - Disable rollback: N
# - Save arguments to config: Y

# Subsequent deployments
sam deploy
```

### Step 5: Get API URL

```bash
aws cloudformation describe-stacks \
  --stack-name DoctorAibolitStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

---

## Option 3: Serverless Framework

### Step 1: Install Serverless Framework

```bash
npm install -g serverless
serverless --version
```

### Step 2: Create Serverless Account (Free)

1. Go to https://www.serverless.com
2. Sign up for free account
3. Get your access token

### Step 3: Configure Serverless

```bash
serverless login
# Follow prompts to authenticate
```

### Step 4: Build Backend

```bash
cd backend
dotnet publish -c Release -o bin/Release/net8.0
cd ..
```

### Step 5: Deploy

```bash
cd infrastructure
serverless deploy

# Or deploy to specific stage
serverless deploy --stage prod
```

### Step 6: Get API URL

```bash
serverless info
# Look for "endpoints" in the output
```

---

## Frontend Deployment

### Option 1: AWS Amplify (Recommended)

#### Step 1: Prepare Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. Make sure `amplify.yml` is in the repository root

#### Step 2: Connect to Amplify

1. Go to AWS Console → Amplify
2. Click "New app" → "Host web app"
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Authorize AWS to access your repository
5. Select your repository and branch
6. Amplify will auto-detect `amplify.yml`

#### Step 3: Configure Build Settings

Amplify should auto-detect settings from `amplify.yml`, but verify:

1. App name: `doctoraibolit`
2. Environment variables:
   - `VITE_API_URL`: Your API Gateway URL from backend deployment
3. Build settings: Should use `amplify.yml` from repository

#### Step 4: Deploy

1. Click "Save and deploy"
2. Amplify will:
   - Install dependencies
   - Build the application
   - Deploy to a URL like: `https://main.xxxxx.amplifyapp.com`

#### Step 5: Custom Domain (Optional)

1. In Amplify console → "Domain management"
2. Click "Add domain"
3. Enter your domain: `doctoraibolit.com`
4. Follow DNS configuration instructions
5. Update your domain's DNS records in Route53 or your DNS provider

---

## Post-Deployment Configuration

### 1. Verify DynamoDB Tables

```bash
aws dynamodb list-tables --region us-east-1
```

Should show:
- Visitors
- ChatSessions
- ChatMessages
- ContactMessages
- PricingConfig
- PricingPlans
- VisitorSessions

### 2. Verify S3 Bucket

```bash
aws s3 ls | grep doctoraibolit
```

Should show: `doctoraibolit-og-images`

### 3. Configure Amazon SES

#### Step 1: Verify Email Addresses

```bash
aws ses verify-email-identity \
  --email-address noreply@doctoraibolit.com \
  --region us-east-1

aws ses verify-email-identity \
  --email-address admin@doctoraibolit.com \
  --region us-east-1
```

Check your email and click verification links.

#### Step 2: Move Out of Sandbox (Production)

If you're in SES sandbox mode:

1. Go to AWS Console → SES → Account dashboard
2. Click "Request production access"
3. Fill out the form:
   - Use case: Transactional emails
   - Website URL: https://doctoraibolit.com
   - Describe your use case
4. Wait for approval (usually 24-48 hours)

### 4. Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-api-url/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy the webhook signing secret
6. Update AWS Secrets Manager:
   ```bash
   aws secretsmanager update-secret \
     --secret-id doctoraibolit \
     --secret-string file://secret.json
   ```

### 5. Upload Default OG Image

```bash
# Create or download a 1200x630px image
aws s3 cp default-og-image.png \
  s3://doctoraibolit-og-images/og/default.png \
  --acl public-read
```

### 6. Test API Endpoint

```bash
# Test health endpoint (if available)
curl https://your-api-url/api/health

# Test chat endpoint
curl -X POST https://your-api-url/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Visitor-Id: test-visitor-123" \
  -d '{"message": "Hello", "sessionId": "test-session"}'
```

---

## Verification & Testing

### 1. Test Backend API

```bash
# Get API URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name DoctorAibolitStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)

# Test chat endpoint
curl -X POST ${API_URL}/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Visitor-Id: test-$(date +%s)" \
  -d '{
    "message": "What are common symptoms of a cold?",
    "sessionId": "test-session-123"
  }'
```

### 2. Test Frontend

1. Open your Amplify URL or custom domain
2. Navigate to `/chat`
3. Send a test message
4. Verify response is received

### 3. Test Admin Dashboard

1. Navigate to `/admin/login`
2. Enter your admin secret (from Secrets Manager)
3. Verify you can access the dashboard
4. Check that you can see users, emails, etc.

### 4. Test Stripe Integration

1. Go to landing page
2. Click on a pricing plan
3. Complete test checkout (use Stripe test card: 4242 4242 4242 4242)
4. Verify credits are added to your account

---

## Troubleshooting

### CDK Issues

**Error: "CDK toolkit stack not found"**
```bash
cdk bootstrap
```

**Error: "Cannot find module"**
```bash
cd infrastructure/cdk
npm install
```

**Error: "Lambda code not found" or "Docker ENOENT" or "spawnSync docker ENOENT"**

The CDK stack uses pre-built binaries (Docker is NOT required). Build the backend first:

```bash
cd backend
dotnet restore
dotnet publish -c Release -o bin/Release/net8.0

# Verify the build output exists
ls -la bin/Release/net8.0/DoctorAIBolit.Api.dll

# Then try CDK deploy again
cd ../infrastructure/cdk
cdk deploy
```

**Note:** The CDK stack was updated to use pre-built binaries instead of Docker bundling. Make sure the backend is built before deploying.

### API Gateway Issues

**403 Forbidden**
- Check CORS configuration
- Verify API Gateway is deployed
- Check Lambda function permissions

**500 Internal Server Error**
- Check CloudWatch logs:
  ```bash
  aws logs tail /aws/lambda/DoctorAibolitApi --follow
  ```
- Verify Secrets Manager secret exists
- Check DynamoDB table permissions

### DynamoDB Issues

**Tables not created**
- Check CloudFormation stack events
- Verify IAM permissions
- Check table names match environment variables

### Secrets Manager Issues

**Secret not found**
```bash
# Verify secret exists
aws secretsmanager describe-secret --secret-id doctoraibolit

# Check Lambda has permission
aws iam get-role-policy \
  --role-name DoctorAibolitApi-role-xxxxx \
  --policy-name SecretsManagerAccess
```

### Frontend Issues

**API calls failing**
- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Verify API Gateway URL is correct

**Build fails in Amplify**
- Check `amplify.yml` syntax
- Verify Node.js version (should be 18+)
- Check build logs in Amplify console

---

## Quick Reference Commands

### CDK Commands
```bash
cd infrastructure/cdk
cdk synth          # Generate CloudFormation template
cdk diff           # Show changes
cdk deploy         # Deploy stack
cdk destroy        # Delete stack
cdk list           # List stacks
```

### AWS CLI Commands
```bash
# Check deployment status
aws cloudformation describe-stacks --stack-name DoctorAibolitStack

# View Lambda logs
aws logs tail /aws/lambda/DoctorAibolitApi --follow

# List DynamoDB tables
aws dynamodb list-tables

# Check S3 bucket
aws s3 ls s3://doctoraibolit-og-images
```

### Useful URLs
- AWS Console: https://console.aws.amazon.com
- CloudFormation: https://console.aws.amazon.com/cloudformation
- Lambda: https://console.aws.amazon.com/lambda
- API Gateway: https://console.aws.amazon.com/apigateway
- Amplify: https://console.aws.amazon.com/amplify

---

## Next Steps

After successful deployment:

1. ✅ Set up monitoring and alerts in CloudWatch
2. ✅ Configure custom domain for frontend
3. ✅ Set up CI/CD pipeline
4. ✅ Add analytics (Google Analytics, etc.)
5. ✅ Configure backup strategy for DynamoDB
6. ✅ Set up staging environment
7. ✅ Implement rate limiting
8. ✅ Add security headers

---

## Support

For issues:
1. Check CloudWatch logs
2. Review CloudFormation stack events
3. Verify all prerequisites are installed
4. Check AWS service quotas/limits
5. Review IAM permissions

For questions about DoctorAIBolit:
- See `README.md` for project overview
- See `PROJECT_SUMMARY.md` for architecture details
- See `backend/README.md` for backend documentation
- See `frontend/README.md` for frontend documentation

