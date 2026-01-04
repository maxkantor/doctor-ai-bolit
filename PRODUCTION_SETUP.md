# Production Setup Guide: Amplify Domain & Stripe Production

This comprehensive guide covers setting up a custom domain in AWS Amplify and switching Stripe to production mode.

## Part 1: Setting Up Amplify Custom Domain

### Prerequisites
- Domain registered with a domain registrar (e.g., Route 53, GoDaddy, Namecheap)
- AWS Amplify app already deployed
- Access to your domain's DNS settings

### Step 1: Add Domain in AWS Amplify Console

1. Go to **AWS Amplify Console** → https://console.aws.amazon.com/amplify
2. Select your app (`doctor-ai-bolit` or similar)
3. Click **Domain management** in the left sidebar
4. Click **Add domain**
5. Enter your domain name (e.g., `doctoraibolit.com`)
6. Click **Configure domain**

### Step 2: Configure Domain Settings

1. **Subdomain**: 
   - For root domain: Leave blank or use `@`
   - For www subdomain: Enter `www`
   - You can add both root and www
2. **Branch**: Select your main branch (usually `main`)
3. Click **Save**

### Step 3: DNS Configuration

Amplify will provide DNS records to add to your domain registrar:

**For Root Domain:**
- **Type**: A or ALIAS
- **Name**: @ (or leave blank)
- **Value**: Provided by Amplify

**For www Subdomain:**
- **Type**: CNAME
- **Name**: www
- **Value**: Provided by Amplify

**Steps:**
1. Copy the DNS records from Amplify
2. Go to your domain registrar's DNS management
3. Add the records provided by Amplify
4. Save changes

### Step 4: Wait for DNS Propagation

- DNS changes can take 24-48 hours to fully propagate
- Usually works within 1-2 hours
- You can check propagation status at: https://www.whatsmydns.net/

### Step 5: SSL Certificate

- Amplify automatically provisions an SSL certificate via AWS Certificate Manager
- Certificate is free and auto-renewed
- Status will show "Available" when ready

### Step 6: Verify Domain

1. Check domain status in Amplify Console
2. Status should show "Available" when DNS is properly configured
3. Test by visiting your custom domain: `https://doctoraibolit.com`

### Step 7: Update Frontend URLs (if needed)

Update any hardcoded URLs in your frontend:

1. **index.html**: Update meta tags with new domain
2. **API URLs**: Update if they reference the domain
3. **CORS**: Update API Gateway CORS settings if needed

## Part 2: Stripe Production Mode Setup

### Prerequisites
- Stripe account with production access
- Access to AWS Secrets Manager
- Admin access to your application

### Step 1: Get Your Production Keys from Stripe

**In Stripe Dashboard:**
1. Make sure you're in **Production mode** (toggle in top right)
2. Go to **Developers → API keys**
   - Copy your **Secret key** (starts with `sk_live_...`)
   - **Note**: You don't need the publishable key for backend
3. Go to **Developers → Webhooks**
   - Click on your production webhook endpoint (or create one)
   - Click "Reveal" next to "Signing secret"
   - Copy the **Signing secret** (starts with `whsec_...`)

### Step 2: Create Production Products and Prices in Stripe

**Important:** You need to create new products and prices in **Production mode**:

1. Switch Stripe Dashboard to **Production mode** (top right toggle)
2. Go to **Products** → **Add product**
3. Create products matching your pricing plans:
   - **Name**: "20 Messages" (or your plan name)
   - **Description**: "20 AI health guidance messages"
4. For each product, add a price:
   - **Pricing model**: Standard pricing
   - **Price**: Set your price (e.g., $1.99)
   - **Billing period**: One time
   - **Currency**: USD
5. Click **Save product**
6. Copy the **Price ID** for each product (starts with `price_...`)
   - Example: `price_1ABC123def456GHI789`

### Step 3: Update Pricing Plans in Admin Dashboard

1. Go to your Admin Dashboard → **Pricing** tab
2. For each plan, click **Edit**
3. Update the **Stripe Price ID** field with the production Price IDs from step 2
4. Save each plan
5. Verify all plans have production Price IDs

### Step 4: Create Production Webhook in Stripe

1. In Stripe Dashboard (Production mode), go to **Developers → Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-api-domain.com/api/stripe/webhook`
   - Replace `your-api-domain.com` with your actual API Gateway domain
   - Example: `https://abc123.execute-api.us-east-1.amazonaws.com/api/stripe/webhook`
4. **Description**: "Production webhook for DoctorAibolit"
5. **Events to send**: Select:
   - `checkout.session.completed` (required)
   - `charge.succeeded` (optional, as fallback)
6. Click **Add endpoint**
7. After creation, click on the webhook endpoint
8. Click **Reveal** next to "Signing secret"
9. Copy the signing secret (starts with `whsec_...`)

### Step 5: Update AWS Secrets Manager

**Option A: Using AWS Console (Recommended)**
1. Go to **AWS Secrets Manager** → https://console.aws.amazon.com/secretsmanager
2. Find the secret named: `doctoraibolit`
3. Click on the secret
4. Click **Edit** in the "Secret value" section
5. Update these two keys while keeping all other keys:
   ```json
   {
     "ADMIN_SECRET": "your-existing-admin-key",
     "OPENAI_API_KEY": "your-existing-openai-key",
     "STRIPE_SECRET_KEY": "sk_live_YOUR_PRODUCTION_SECRET_KEY",
     "STRIPE_WEBHOOK_SECRET": "whsec_YOUR_PRODUCTION_WEBHOOK_SECRET",
     "FROM_EMAIL": "your-existing-email",
     "ADMIN_EMAIL": "your-existing-admin-email"
   }
   ```
6. **Important:** Replace only the Stripe keys, keep all other existing values
7. Click **Save**

**Option B: Using AWS CLI**
```bash
# First, get your existing secret to see current values
aws secretsmanager get-secret-value --secret-id doctoraibolit --query SecretString --output text

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

### Step 6: Redeploy Lambda Function

**Important:** After updating secrets, you must redeploy your Lambda function because secrets are cached on first load.

**Option A: Upload New Deployment**
1. Go to AWS Lambda Console
2. Select your Lambda function
3. Upload a new `backend.zip` (even if unchanged, this triggers a redeploy)

**Option B: Wait for Cold Start**
- Wait 5-10 minutes for Lambda to cold start
- This will reload secrets from Secrets Manager

### Step 7: Verify Production Mode

**Check CloudWatch Logs:**
1. Go to AWS CloudWatch → Log groups
2. Find your Lambda function's log group
3. Look for `[StripeService]` logs
4. Verify no errors about "test mode" vs "live mode"

**Test a Purchase:**
1. Make a test purchase using a real card (Stripe test cards won't work in production)
2. Use a small amount first (e.g., $1.99)
3. Check that:
   - Payment processes successfully
   - Webhook is received (check CloudWatch logs)
   - Credits are added to your account
   - Admin notification email is sent

## Verification Checklist

### Amplify Domain
- [ ] Domain added in Amplify Console
- [ ] DNS records added to domain registrar
- [ ] DNS propagation complete (check whatsmydns.net)
- [ ] SSL certificate shows "Available" in Amplify
- [ ] Domain accessible at `https://yourdomain.com`
- [ ] Frontend URLs updated if needed

### Stripe Production
- [ ] Stripe dashboard is in **Production mode**
- [ ] Production products and prices created in Stripe
- [ ] Pricing plans in Admin Dashboard updated with production Price IDs
- [ ] Production webhook endpoint created in Stripe
- [ ] `STRIPE_SECRET_KEY` in Secrets Manager starts with `sk_live_`
- [ ] `STRIPE_WEBHOOK_SECRET` in Secrets Manager matches production webhook
- [ ] Lambda function redeployed after updating secrets
- [ ] Webhook endpoint URL in Stripe points to production API Gateway
- [ ] Test purchase completed successfully
- [ ] Webhook events being received (check CloudWatch logs)
- [ ] Credits added correctly after purchase
- [ ] Admin notification email received

## Common Issues

### Domain Issues

**Issue: Domain not resolving**
- **Cause**: DNS records not propagated yet
- **Fix**: Wait 24-48 hours, or check DNS records are correct

**Issue: SSL certificate pending**
- **Cause**: DNS not fully propagated
- **Fix**: Wait for DNS propagation, then SSL will auto-provision

### Stripe Issues

**Issue: "Mode mismatch" error**
- **Cause**: API key is production (`sk_live_`) but webhook secret is test (or vice versa)
- **Fix**: Make sure both keys are from the same mode (both production)

**Issue: Webhook signature verification fails**
- **Cause**: Wrong webhook secret
- **Fix**: Make sure you're using the signing secret from the correct webhook endpoint in Stripe

**Issue: Still seeing test mode after update**
- **Cause**: Lambda is using cached secrets
- **Fix**: Redeploy Lambda or wait for cold start (secrets are cached on first load)

**Issue: Price ID not found**
- **Cause**: Using test Price IDs in production mode (or vice versa)
- **Fix**: Create new products/prices in production mode and update Admin Dashboard

**Issue: Webhook not received**
- **Cause**: Webhook URL incorrect or API Gateway not accessible
- **Fix**: Verify webhook URL in Stripe matches your API Gateway endpoint

## Support

If you encounter issues:
1. Check CloudWatch logs for detailed error messages
2. Verify all keys match the correct mode (test vs production)
3. Ensure Lambda function has been redeployed
4. Test webhook using Stripe's webhook testing tool
