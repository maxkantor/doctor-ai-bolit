# Production Setup Guide: Amplify Domain & Stripe Production

This guide covers setting up a custom domain in AWS Amplify and switching Stripe to production mode.

## Part 1: Setting Up Amplify Custom Domain

### 1. Add Domain in AWS Amplify Console

1. Go to **AWS Amplify Console**
2. Select your app (`doctor-ai-bolit` or similar)
3. Click **Domain management** in the left sidebar
4. Click **Add domain**
5. Enter your domain name (e.g., `doctoraibolit.com`)
6. Click **Configure domain**

### 2. Configure Domain Settings

1. **Subdomain**: Choose your main subdomain (usually `www` or leave blank for root)
2. **Branch**: Select your main branch (usually `main`)
3. Click **Save**

### 3. DNS Configuration

Amplify will provide DNS records to add to your domain registrar:

1. **CNAME Record**: Add the CNAME record provided by Amplify
2. **Wait for propagation**: DNS changes can take 24-48 hours, but usually work within a few hours
3. **SSL Certificate**: Amplify automatically provisions an SSL certificate via AWS Certificate Manager

### 4. Verify Domain

1. Check domain status in Amplify Console
2. Status should show "Available" when DNS is properly configured
3. Test by visiting your custom domain

### 5. Update Frontend URLs (if needed)

If you have hardcoded URLs in your frontend, update them:
- Update `index.html` meta tags with new domain
- Update any API URLs if they reference the domain
- Update CORS settings in API Gateway if needed

## Part 2: Stripe Production Mode Setup

### Issue: Still Seeing Test Mode After Switching Webhooks

If you changed your Stripe webhook to production but still see test mode, you need to update **both** the API key and webhook secret in AWS Secrets Manager.

### Steps to Switch to Production

#### 1. Get Your Production Keys from Stripe

**In Stripe Dashboard:**
1. Make sure you're in **Production mode** (toggle in top right)
2. Go to **Developers → API keys**
   - Copy your **Secret key** (starts with `sk_live_...`)
3. Go to **Developers → Webhooks**
   - Click on your production webhook endpoint
   - Click "Reveal" next to "Signing secret"
   - Copy the **Signing secret** (starts with `whsec_...`)

#### 2. Create Production Products and Prices in Stripe

**Important:** You need to create new products and prices in **Production mode**:

1. Switch Stripe Dashboard to **Production mode**
2. Go to **Products** → **Add product**
3. Create products matching your pricing plans (e.g., "20 Messages", "50 Messages")
4. For each product, add a price:
   - **Recurring**: One time
   - **Price**: Set your price (e.g., $1.99)
   - **Currency**: USD
5. Copy the **Price ID** for each product (starts with `price_...`)

#### 3. Update Pricing Plans in Admin Dashboard

1. Go to your Admin Dashboard → **Pricing** tab
2. For each plan, update the **Stripe Price ID** with the production Price IDs from step 2
3. Save each plan

#### 4. Create Production Webhook in Stripe

1. In Stripe Dashboard (Production mode), go to **Developers → Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-api-domain.com/api/stripe/webhook`
   - Replace `your-api-domain.com` with your actual API Gateway domain
4. **Events to send**: Select:
   - `checkout.session.completed`
   - `charge.succeeded` (optional, as fallback)
5. Click **Add endpoint**
6. Click **Reveal** next to "Signing secret" and copy it

#### 5. Update AWS Secrets Manager

**Option A: Using AWS Console**
1. Go to **AWS Secrets Manager**
2. Find the secret named: `doctoraibolit`
3. Click **Edit**
4. Update these two keys:
   ```json
   {
     "STRIPE_SECRET_KEY": "sk_live_YOUR_PRODUCTION_SECRET_KEY",
     "STRIPE_WEBHOOK_SECRET": "whsec_YOUR_PRODUCTION_WEBHOOK_SECRET"
   }
   ```
5. **Important:** Keep all other existing keys (ADMIN_SECRET, OPENAI_API_KEY, etc.)
6. Save changes

**Option B: Using AWS CLI**
```bash
# First, get your existing secret to preserve other keys
aws secretsmanager get-secret-value --secret-id doctoraibolit

# Then update with production Stripe keys (replace with your actual values)
aws secretsmanager update-secret \
  --secret-id doctoraibolit \
  --secret-string '{
    "ADMIN_SECRET": "your-existing-admin-key",
    "OPENAI_API_KEY": "your-existing-openai-key",
    "STRIPE_SECRET_KEY": "sk_live_YOUR_PRODUCTION_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET": "whsec_YOUR_PRODUCTION_WEBHOOK_SECRET",
    "FROM_EMAIL": "your-existing-email",
    "ADMIN_EMAIL": "your-existing-admin-email"
  }'
```

### 3. Verify the Keys

**Test keys start with:**
- `sk_test_...` (API key)
- Test webhook secrets are different from production

**Production keys start with:**
- `sk_live_...` (API key)
- `whsec_...` (webhook secret - same format for both, but different values)

### 4. Redeploy Lambda (Important!)

After updating secrets, you need to:
1. **Redeploy your Lambda function** OR
2. **Restart the Lambda** (it caches secrets on first load)

The easiest way is to:
- Upload a new backend zip to Lambda
- Or trigger a cold start by waiting a few minutes

### 5. Verify It's Working

**Check CloudWatch Logs:**
- Look for `[StripeService]` logs
- If you see errors about "test mode" vs "live mode", the keys don't match

**Test a Purchase:**
- Make a test purchase in production mode
- Check that the webhook processes correctly
- Verify credits are added to your account

## Common Issues

### Issue: "Mode mismatch" error
**Cause:** API key is production (`sk_live_`) but webhook secret is test (or vice versa)
**Fix:** Make sure both keys are from the same mode (both production or both test)

### Issue: Webhook signature verification fails
**Cause:** Wrong webhook secret
**Fix:** Make sure you're using the signing secret from the correct webhook endpoint in Stripe

### Issue: Still seeing test mode after update
**Cause:** Lambda is using cached secrets
**Fix:** Redeploy Lambda or wait for cold start (secrets are cached on first load)

## Verification Checklist

- [ ] Stripe dashboard is in **Production mode**
- [ ] `STRIPE_SECRET_KEY` in Secrets Manager starts with `sk_live_`
- [ ] `STRIPE_WEBHOOK_SECRET` in Secrets Manager matches the production webhook signing secret
- [ ] Lambda function has been redeployed after updating secrets
- [ ] Webhook endpoint URL in Stripe points to your production API Gateway URL
- [ ] Webhook events are being received (check CloudWatch logs)

