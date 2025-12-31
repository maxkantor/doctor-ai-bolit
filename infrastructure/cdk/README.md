# DoctorAIBolit CDK Infrastructure

AWS CDK infrastructure for deploying the DoctorAIBolit backend API.

> **For complete deployment instructions, see the main [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md)**

## Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed: `npm install -g aws-cdk`
- .NET 8 SDK installed (for building the Lambda function)

## Setup

1. Install dependencies:
```bash
cd infrastructure/cdk
npm install
```

2. **IMPORTANT: Build the backend before deploying:**
```bash
cd ../../backend
dotnet restore
dotnet publish -c Release -o bin/Release/net8.0
cd ../infrastructure/cdk
```

**Note:** The CDK stack uses pre-built binaries, so you MUST build the backend first. Docker is not required.

## Deployment

### Bootstrap CDK (first time only)
```bash
cdk bootstrap
```

### Deploy the stack
```bash
cdk deploy
```

### Deploy to specific region
```bash
cdk deploy --region us-east-1
```

### Preview changes
```bash
cdk diff
```

### Synthesize CloudFormation template
```bash
cdk synth
```

## Stack Resources

The stack creates:

- **Lambda Function**: .NET 8 API handler
- **HTTP API Gateway**: RESTful API endpoint
- **DynamoDB Tables**: 
  - Visitors
  - ChatSessions
  - ChatMessages
  - ContactMessages
  - PricingConfig
  - PricingPlans
  - VisitorSessions
- **S3 Bucket**: `doctoraibolit-og-images` for OG images
- **IAM Roles & Policies**: Permissions for Lambda to access AWS services

## Secrets Manager

The stack references an existing secret named `doctoraibolit` in AWS Secrets Manager. Make sure this secret exists before deploying. It should contain:

- `ADMIN_SECRET`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `FROM_EMAIL` (optional)
- `ADMIN_EMAIL` (optional)

See `backend/SECRETS_CONFIG.md` for details.

## Environment Variables

The Lambda function is configured with the following environment variables:

- DynamoDB table names
- S3 bucket name
- Email addresses

## Outputs

After deployment, the stack outputs:

- `ApiUrl`: The API Gateway endpoint URL
- `LambdaFunctionArn`: The Lambda function ARN
- `OgImagesBucketName`: The S3 bucket name for OG images

## Cleanup

To destroy the stack:

```bash
cdk destroy
```

**Warning**: This will delete all resources. DynamoDB tables and S3 buckets are set to RETAIN, so they won't be deleted automatically.


