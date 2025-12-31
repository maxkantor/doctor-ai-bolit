# DoctorAIBolit Backend

.NET 8 Lambda API for DoctorAIBolit.

## Setup

1. Install .NET 8 SDK
2. Restore packages:
   ```bash
   dotnet restore
   ```
3. Build:
   ```bash
   dotnet build
   ```

## Local Development

Run locally using AWS Lambda Test Tool or configure for local API Gateway testing.

## API Endpoints

### Public Endpoints
- `POST /api/chat` - Send chat message
- `GET /api/chat/sessions` - Get user sessions
- `GET /api/chat/sessions/{sessionId}/messages` - Get session messages
- `POST /api/contact` - Submit contact form
- `POST /api/stripe/checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler
- `GET /api/og/session/{sessionId}` - Get OG image URL

### Admin Endpoints (Requires X-ADMIN-KEY header)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/user/{visitorId}` - Get user details
- `POST /api/admin/credits` - Add credits to user
- `POST /api/admin/reset` - Reset user
- `GET /api/admin/emails` - Get contact messages
- `POST /api/admin/email/reply` - Reply to email

## Environment Variables

Set in `serverless.yml`:
- DynamoDB table names
- S3 bucket name
- SES email addresses

## AWS Secrets Manager

Required secret: `doctoraibolit` with key/value pairs:
- `ADMIN_SECRET` - Admin authentication key
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

The secret should be stored as a JSON object with these keys:
```json
{
  "ADMIN_SECRET": "your-admin-key",
  "STRIPE_SECRET_KEY": "sk_live_...",
  "STRIPE_WEBHOOK_SECRET": "whsec_..."
}
```

