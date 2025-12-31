# DoctorAIBolit - Project Summary

## Overview

Full-stack AI health guidance application providing general health information, symptom explanations, and wellness guidance.

## Architecture

### Backend (.NET 8 Lambda)
- **Runtime**: .NET 8 on AWS Lambda
- **API**: REST API via API Gateway
- **Database**: DynamoDB (4 tables)
- **Storage**: S3 for OG images
- **Email**: Amazon SES
- **Payments**: Stripe
- **Secrets**: AWS Secrets Manager

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Hosting**: AWS Amplify
- **Routing**: React Router
- **Styling**: CSS modules

## Project Structure

```
DoctorAIBolit/
├── backend/                 # .NET 8 Lambda API
│   ├── Controllers/         # API endpoints
│   ├── Models/              # Data models
│   ├── Repositories/        # DynamoDB access
│   ├── Services/            # Business logic
│   └── LambdaEntryPoint.cs  # Lambda entry point
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API clients
│   │   └── utils/          # Utilities
│   └── amplify.yml         # Amplify config
├── infrastructure/          # Deployment configs
│   └── serverless.yml      # Serverless Framework config
└── README.md
```

## Key Features

### Public Features
- ✅ Anonymous chat (no login required)
- ✅ Session management
- ✅ Message limit enforcement
- ✅ Stripe premium subscriptions
- ✅ Contact form
- ✅ Social sharing with OG images
- ✅ YouTube integration page

### Admin Features
- ✅ Admin authentication
- ✅ User management dashboard
- ✅ Contact message management
- ✅ Credit management
- ✅ Email replies

## Database Schema

### Visitors Table
- **PK**: VisitorId (String)
- Fields: createdAt, messageCount, creditBalance, isPremium, lastActive, referralSource

### ChatSessions Table
- **PK**: VisitorId (String)
- **SK**: SessionId (String)
- Fields: title, createdAt

### ChatMessages Table
- **PK**: SessionId (String)
- **SK**: Timestamp (String)
- Fields: role, content

### ContactMessages Table
- **PK**: MessageId (String)
- Fields: name, email, message, status, createdAt

## API Endpoints

### Public
- `POST /api/chat` - Send message
- `GET /api/chat/sessions` - Get sessions
- `GET /api/chat/sessions/{id}/messages` - Get messages
- `POST /api/contact` - Submit contact form
- `POST /api/stripe/checkout` - Create checkout
- `POST /api/stripe/webhook` - Stripe webhook
- `GET /api/og/session/{id}` - Get OG image

### Admin (Requires X-ADMIN-KEY header)
- `GET /api/admin/users` - List users
- `GET /api/admin/user/{id}` - Get user
- `POST /api/admin/credits` - Add credits
- `POST /api/admin/reset` - Reset user
- `GET /api/admin/emails` - List emails
- `POST /api/admin/email/reply` - Reply to email

## Frontend Routes

- `/` - Landing page
- `/chat` - Chat interface
- `/contact` - Contact form
- `/youtube` - YouTube page
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/emails` - Email management
- `/admin/stripe` - Stripe management
- `/admin/settings` - Settings

## Environment Variables

### Backend (in serverless.yml)
- DynamoDB table names
- S3 bucket name
- SES email addresses

### Frontend (.env)
- `VITE_API_URL` - API Gateway URL

### AWS Secrets Manager
- `doctoraibolit` - Secret with key/value pairs:
  - `ADMIN_SECRET` - Admin authentication key
  - `STRIPE_SECRET_KEY` - Stripe API secret key
  - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

## Next Steps

1. **AI Integration**: Enhance AI responses with additional health guidance capabilities
2. **OG Image Generation**: Implement dynamic OG image generation service
3. **Analytics**: Add analytics tracking (Google Analytics, etc.)
4. **Error Handling**: Enhance error handling and user feedback
5. **Testing**: Add unit and integration tests
6. **Monitoring**: Set up CloudWatch dashboards and alarms
7. **Rate Limiting**: Implement rate limiting for API endpoints
8. **Caching**: Add caching layer for frequently accessed data

## Security Considerations

- ✅ Admin authentication via Secrets Manager
- ✅ CORS configured
- ✅ Input validation needed
- ⚠️ Add rate limiting
- ⚠️ Add request validation middleware
- ⚠️ Implement HTTPS only
- ⚠️ Add security headers

## Cost Optimization

- Serverless architecture (pay per use)
- DynamoDB on-demand pricing
- S3 for static assets
- Route53 DNS only guaranteed cost
- Lambda free tier: 1M requests/month
- API Gateway free tier: 1M requests/month

## Support

For issues or questions, refer to:
- `backend/README.md` - Backend documentation
- `frontend/README.md` - Frontend documentation
- `infrastructure/README.md` - Infrastructure docs
- `DEPLOYMENT.md` - Deployment guide

