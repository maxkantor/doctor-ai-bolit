# Deployment Guide

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with credentials (`aws configure`)
3. **.NET 8 SDK** installed
4. **Choose one deployment method:**
   - **AWS SAM CLI** (Recommended - no account required): Already installed ✓
   - **Serverless Framework** (Requires free account): `npm install -g serverless`

## Step 1: Backend Deployment

### 1.1 Configure AWS Secrets Manager

The application uses a secret named `doctoraibolit` with key/value pairs:

- `ADMIN_SECRET` - Admin authentication key
- `OPENAI_API_KEY` - OpenAI API key (required for AI chat functionality)
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

**If you need to create or update the secret:**

```bash
# Create the secret with key/value pairs
aws secretsmanager create-secret \
  --name doctoraibolit \
  --secret-string '{
    "ADMIN_SECRET": "your-admin-secret-key-here",
    "OPENAI_API_KEY": "sk-your-openai-api-key",
    "STRIPE_SECRET_KEY": "sk_live_...",
    "STRIPE_WEBHOOK_SECRET": "whsec_..."
  }'
```

**Or update existing secret:**

```bash
aws secretsmanager update-secret \
  --secret-id doctoraibolit \
  --secret-string '{
    "ADMIN_SECRET": "your-admin-secret-key-here",
    "OPENAI_API_KEY": "sk-your-openai-api-key",
    "STRIPE_SECRET_KEY": "sk_live_...",
    "STRIPE_WEBHOOK_SECRET": "whsec_..."
  }'
```

**Note:** The secret should already be created in AWS Secrets Manager with the key/value structure shown above.

### 1.2 Deploy Backend

**Option 1: Using AWS SAM (Recommended - No account required)**
```powershell
cd infrastructure
.\deploy-sam.ps1
```

Or manually:
```powershell
# Build and publish the .NET project
cd backend
dotnet restore
dotnet publish --configuration Release --output bin/Release/net8.0

# Deploy using SAM
cd ..\infrastructure
sam build
sam deploy --guided
```

**Option 2: Using Serverless Framework (Requires free account)**
```powershell
cd infrastructure
.\deploy.ps1
```

Or manually:
```powershell
# Build and publish the .NET project
cd backend
dotnet restore
dotnet publish --configuration Release --output bin/Release/net8.0

# Deploy to AWS
cd ..\infrastructure
serverless deploy
```

**Note:** Make sure you have:
- AWS CLI configured with credentials (`aws configure`)
- For SAM: AWS SAM CLI installed (`sam --version` to check)
- For Serverless: Serverless Framework installed (`npm install -g serverless`) and account/login
- Appropriate AWS permissions

This will create:
- Lambda function
- API Gateway
- DynamoDB tables
- S3 bucket for OG images
- IAM roles and policies

### 1.3 Note API Gateway URL

After deployment, note the API Gateway URL from the Serverless output. You'll need this for the frontend.

## Step 2: Frontend Deployment

### 2.1 Configure Environment Variables in Amplify

In AWS Amplify Console:
1. Go to your app settings
2. Navigate to "Environment variables"
3. Add the following variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://20w3xkkm0a.execute-api.us-east-1.amazonaws.com/api`

### 2.2 Deploy to AWS Amplify

1. Go to AWS Amplify Console
2. Click "New app" > "Host web app"
3. Connect your GitHub repository (your repository name)
4. **Important:** Leave the root directory as `/` (root of repository)
5. Amplify will auto-detect `amplify.yml` at the root
6. **CRITICAL:** In the build settings, make sure "Use a build specification file" is selected and points to `amplify.yml`
   - If you see "Edit build settings" instead, click it and ensure it's using the file from the repository
   - Do NOT use the console's build settings editor - it will override the file
7. Add environment variable `VITE_API_URL` (see 2.1 above)
8. Review build settings (should auto-detect from `amplify.yml`)
9. Deploy

**Note:** The `amplify.yml` file is at the repository root and will automatically build from the `frontend` directory.

**Troubleshooting:** If Amplify is not using your `amplify.yml` file:
1. Go to App settings → Build settings
2. Click "Edit" 
3. Select "Use a build specification file" 
4. Enter `amplify.yml` as the file path
5. Save and redeploy

### 2.3 Configure Custom Domain (Optional)

1. In Amplify console, go to "Domain management"
2. Add your custom domain (e.g., doctoraibolit.com)
3. Configure Route53 DNS records as instructed

## Step 3: Stripe Configuration

### 3.1 Create Products and Prices

1. Go to Stripe Dashboard
2. Create a product: "DoctorAIBolit Premium"
3. Create a monthly subscription price
4. Note the Price ID (starts with `price_`)

### 3.2 Configure Webhook

1. In Stripe Dashboard, go to Webhooks
2. Add endpoint: `https://your-api-gateway-url.amazonaws.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook signing secret
5. Update the secret in AWS Secrets Manager

## Step 4: Amazon SES Configuration

### 4.1 Verify Email Addresses

1. Go to Amazon SES Console
2. Verify sender email: `noreply@doctoraibolit.com`
3. Verify admin email: `admin@doctoraibolit.com`

### 4.2 Move Out of Sandbox (Production)

If in sandbox mode, request production access:
1. Go to SES Console > Account dashboard
2. Request production access
3. Wait for approval

## Step 5: S3 OG Images

### 5.1 Upload Default OG Image

1. Create a default OG image (1200x630px)
2. Upload to S3 bucket: `doctoraibolit-og-images/og/default.png`
3. Set public read permissions

### 5.2 Configure OG Image Generation (Optional)

For dynamic session OG images, implement image generation service that:
- Generates images with session text
- Uploads to S3: `og/session-{sessionId}.png`
- Updates OG meta tags dynamically

## Step 6: Testing

### 6.1 Test Public Endpoints

```bash
# Test chat endpoint
curl -X POST https://your-api-url/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Visitor-Id: test-visitor-123" \
  -d '{"visitorId":"test-visitor-123","sessionId":"session-1","message":"Hello"}'
```

### 6.2 Test Admin Endpoints

```bash
# Test admin login
curl -X GET https://your-api-url/api/admin/users \
  -H "X-ADMIN-KEY: your-admin-key"
```

## Step 7: Monitoring

### 7.1 CloudWatch Logs

Monitor Lambda function logs in CloudWatch:
- `/aws/lambda/doctor-ai-bolit-dev-api`

### 7.2 Set Up Alarms

Create CloudWatch alarms for:
- Lambda errors
- API Gateway 5xx errors
- DynamoDB throttling

## Troubleshooting

### Lambda Timeout Issues
- Increase timeout in `serverless.yml`
- Optimize code performance

### CORS Issues
- Verify CORS configuration in `Startup.cs`
- Check API Gateway CORS settings

### DynamoDB Access Issues
- Verify IAM role permissions
- Check table names match configuration

### Stripe Webhook Issues
- Verify webhook secret matches
- Check webhook endpoint is accessible
- Review CloudWatch logs for errors

