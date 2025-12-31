# Secrets Manager Configuration

## Current Structure

The application uses a secret named: `doctoraibolit` with key/value pairs.

### Key/Value Format

The secret is stored as a JSON object with these keys:
```json
{
  "ADMIN_SECRET": "your-admin-authentication-key",
  "OPENAI_API_KEY": "sk-your-openai-api-key",
  "STRIPE_SECRET_KEY": "sk_live_your_stripe_secret_key",
  "STRIPE_WEBHOOK_SECRET": "whsec_your_webhook_signing_secret",
  "FROM_EMAIL": "your-verified-email@example.com",
  "ADMIN_EMAIL": "admin@example.com"
}
```

**Note:** `FROM_EMAIL` and `ADMIN_EMAIL` are optional. If not provided, defaults to `noreply@doctoraibolit.com` and `admin@doctoraibolit.com`. The `FROM_EMAIL` must be verified in AWS SES in the same region as your Lambda function.

## Creating the Secret

### Using AWS CLI

```bash
aws secretsmanager create-secret \
  --name doctoraibolit \
  --secret-string '{
    "ADMIN_SECRET": "your-admin-key-here",
    "OPENAI_API_KEY": "sk-your-openai-api-key",
    "STRIPE_SECRET_KEY": "sk_live_...",
    "STRIPE_WEBHOOK_SECRET": "whsec_...",
    "FROM_EMAIL": "your-verified-email@example.com",
    "ADMIN_EMAIL": "admin@example.com"
  }'
```

### Using AWS Console

1. Go to AWS Secrets Manager
2. Click "Store a new secret"
3. Select "Other type of secret"
4. Choose "Plaintext" and enter the JSON with key/value pairs
5. Name it `doctoraibolit`
6. Complete the wizard

## Updating the Secret

### Using AWS CLI

```bash
aws secretsmanager update-secret \
  --secret-id doctoraibolit \
  --secret-string '{
    "ADMIN_SECRET": "new-admin-key",
    "OPENAI_API_KEY": "sk-your-openai-api-key",
    "STRIPE_SECRET_KEY": "sk_live_new_key",
    "STRIPE_WEBHOOK_SECRET": "whsec_new_secret"
  }'
```

### Using AWS Console

1. Go to AWS Secrets Manager
2. Select the `doctoraibolit` secret
3. Click "Edit" in the "Secret value" section
4. Update the key/value pairs
5. Save changes

## Customizing the Structure

If you need to add more keys to the secret, update:

1. **`backend/Services/SecretsService.cs`** - Add new keys to the `LoadSecretsAsync` method
2. **`backend/Services/SecretsService.cs`** - Add properties to `AppSecrets` or `StripeSecrets` classes if needed
3. **`infrastructure/serverless.yml`** - IAM permissions already allow access to the secret

### Example: Adding New Keys

To add a new key (e.g., `API_KEY`):

1. Update `LoadSecretsAsync` in `SecretsService.cs`:
```csharp
return new AppSecrets
{
    AdminSecret = secretData.GetValueOrDefault("ADMIN_SECRET", string.Empty),
    ApiKey = secretData.GetValueOrDefault("API_KEY", string.Empty), // New key
    Stripe = new StripeSecrets
    {
        SecretKey = secretData.GetValueOrDefault("STRIPE_SECRET_KEY", string.Empty),
        WebhookSecret = secretData.GetValueOrDefault("STRIPE_WEBHOOK_SECRET", string.Empty)
    }
};
```

2. Add the property to `AppSecrets` class:
```csharp
public class AppSecrets
{
    public string AdminSecret { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty; // New property
    public StripeSecrets Stripe { get; set; } = new();
}
```

