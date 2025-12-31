using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using System.Text.Json;

namespace DoctorAIBolit.Services;

public class SecretsService
{
    private readonly IAmazonSecretsManager _secretsManager;
    private readonly Lazy<Task<AppSecrets>> _secrets;
    private const string SecretName = "doctoraibolit";

    public SecretsService(IAmazonSecretsManager secretsManager)
    {
        _secretsManager = secretsManager;
        _secrets = new Lazy<Task<AppSecrets>>(LoadSecretsAsync);
    }

    public async Task<AppSecrets> GetSecretsAsync()
    {
        return await _secrets.Value;
    }

    private async Task<AppSecrets> LoadSecretsAsync()
    {
        var request = new GetSecretValueRequest
        {
            SecretId = SecretName
        };

        var response = await _secretsManager.GetSecretValueAsync(request);
        
        // Parse the secret value - it's stored as key/value pairs in JSON format
        var secretData = JsonSerializer.Deserialize<Dictionary<string, string>>(response.SecretString)
            ?? throw new InvalidOperationException("Failed to deserialize secrets");

        return new AppSecrets
        {
            AdminSecret = secretData.GetValueOrDefault("ADMIN_SECRET", string.Empty),
            OpenAIApiKey = secretData.GetValueOrDefault("OPENAI_API_KEY", string.Empty),
            FromEmail = secretData.GetValueOrDefault("FROM_EMAIL", "noreply@doctoraibolit.com"),
            AdminEmail = secretData.GetValueOrDefault("ADMIN_EMAIL", "admin@doctoraibolit.com"),
            Stripe = new StripeSecrets
            {
                SecretKey = secretData.GetValueOrDefault("STRIPE_SECRET_KEY", string.Empty),
                WebhookSecret = secretData.GetValueOrDefault("STRIPE_WEBHOOK_SECRET", string.Empty)
            }
        };
    }
}

public class AppSecrets
{
    public string AdminSecret { get; set; } = string.Empty;
    public string OpenAIApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "noreply@doctoraibolit.com";
    public string AdminEmail { get; set; } = "admin@doctoraibolit.com";
    public StripeSecrets Stripe { get; set; } = new();
}

public class StripeSecrets
{
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
}

