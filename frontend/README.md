# DoctorAIBolit Frontend

React + TypeScript frontend for DoctorAIBolit.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Update `VITE_API_URL` in `.env` with your API endpoint

## Development

Run development server:
```bash
npm run dev
```

## Build

Build for production:
```bash
npm run build
```

## Deployment

Deploy to AWS Amplify:
1. Connect repository to AWS Amplify
2. Amplify will auto-detect `amplify.yml` and deploy

## Features

- Landing page with SEO optimization
- Chat interface with session management
- Contact form
- Admin dashboard
- Social sharing with OG images
- YouTube integration page

