# Stripe Production Mode Setup

## Issue: Still Seeing Test Mode After Switching Webhooks

If you changed your Stripe webhook to production but still see test mode, you need to update **both** the API key and webhook secret in AWS Secrets Manager.

## Steps to Switch to Production

### 1. Get Your Production Keys from Stripe

**In Stripe Dashboard:**
1. Make sure you're in **Production mode** (toggle in top right)
2. Go to **Developers → API keys**
   - Copy your **Secret key** (starts with `sk_live_...`)
3. Go to **Developers → Webhooks**
   - Click on your production webhook endpoint
   - Click "Reveal" next to "Signing secret"
   - Copy the **Signing secret** (starts with `whsec_...`)

### 2. Update AWS Secrets Manager

**Option A: Using AWS Console**
1. Go to **AWS Secrets Manager**
2. Find the secret named: `anxietychatai`
3. Click **Edit**
4. Update these two keys:
   ```json
   {
     "STRIPE_SECRET_KEY": "sk_live_YOUR_PRODUCTION_SECRET_KEY",
     "STRIPE_WEBHOOK_SECRET": "whsec_YOUR_PRODUCTION_WEBHOOK_SECRET"
   }
   ```
5. Save changes

**Option B: Using AWS CLI**
```bash
aws secretsmanager update-secret \
  --secret-id anxietychatai \
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

