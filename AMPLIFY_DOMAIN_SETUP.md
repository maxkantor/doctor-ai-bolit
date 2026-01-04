# Amplify Custom Domain Setup

This guide explains how to configure a custom domain in AWS Amplify and update the application to use it.

## Quick Setup

### Step 1: Add Domain in AWS Amplify Console

1. Go to **AWS Amplify Console** → https://console.aws.amazon.com/amplify
2. Select your app
3. Click **Domain management** in the left sidebar
4. Click **Add domain**
5. Enter your domain name (e.g., `yourdomain.com`)
6. Click **Configure domain**

### Step 2: Configure Domain Settings

1. **Subdomain**: 
   - For root domain: Leave blank or use `@`
   - For www subdomain: Enter `www`
   - You can add both root and www
2. **Branch**: Select your main branch (usually `main`)
3. Click **Save**

### Step 3: Configure DNS

1. Amplify will provide DNS records
2. Add these records to your domain registrar (Route 53, GoDaddy, Namecheap, etc.)
3. Wait for DNS propagation (usually 1-2 hours, can take up to 48 hours)

### Step 4: Set Environment Variables in Amplify

After adding your domain, set these environment variables in Amplify Console:

1. Go to **App settings** → **Environment variables**
2. Add the following variables:

   **For root domain:**
   ```
   VITE_DOMAIN=yourdomain.com
   VITE_API_DOMAIN=api.yourdomain.com
   ```

   **Or if using www subdomain:**
   ```
   VITE_DOMAIN=www.yourdomain.com
   VITE_API_DOMAIN=api.yourdomain.com
   ```

3. **Important:** Also set your API URL:
   ```
   VITE_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/api
   ```

### Step 5: Redeploy

1. After setting environment variables, trigger a new deployment
2. Go to **App** → Click **Redeploy this version** or push a new commit
3. The build will automatically:
   - Replace domain references in `index.html`
   - Update `sitemap.xml` with new domain
   - Update `robots.txt` with new domain
   - Configure API URLs

## How It Works

The build process includes a pre-build script (`frontend/scripts/replace-domain.js`) that:

1. Reads `VITE_DOMAIN` and `VITE_API_DOMAIN` environment variables
2. Replaces all hardcoded domain references in:
   - `index.html` (meta tags, canonical URLs, schema.org JSON)
   - `public/sitemap.xml`
   - `public/robots.txt`
3. Updates API service to use the configured API domain

## Default Values

If environment variables are not set, the build will use:
- `VITE_DOMAIN`: `doctoraibolit.com`
- `VITE_API_DOMAIN`: `api.doctoraibolit.com`

## Verification

After deployment, verify:

1. ✅ Domain is accessible: `https://yourdomain.com`
2. ✅ SSL certificate is active (check browser padlock)
3. ✅ Meta tags show correct domain (view page source)
4. ✅ Sitemap is accessible: `https://yourdomain.com/sitemap.xml`
5. ✅ API calls work correctly
6. ✅ Social sharing shows correct domain (test with Facebook/Twitter debuggers)

## Troubleshooting

### Domain not resolving
- Check DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)
- Verify DNS records at: https://www.whatsmydns.net/

### SSL certificate pending
- DNS must be fully propagated first
- SSL certificate is auto-provisioned by Amplify
- Usually takes 1-2 hours after DNS is correct

### Wrong domain in meta tags
- Verify environment variables are set in Amplify
- Check build logs to see which domain was used
- Redeploy after setting environment variables

### API calls failing
- Verify `VITE_API_URL` is set correctly
- Check API Gateway CORS settings allow your new domain
- Verify API Gateway is accessible

## Example Configuration

For domain `example.com`:

**Environment Variables:**
```
VITE_DOMAIN=example.com
VITE_API_DOMAIN=api.example.com
VITE_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/api
```

**DNS Records (from Amplify):**
- Root domain: A record pointing to Amplify's IP
- www subdomain: CNAME record pointing to Amplify's domain

**Result:**
- Frontend: `https://example.com`
- API: `https://api.example.com` (if you set up API Gateway custom domain)
- Or API: Uses `VITE_API_URL` directly
