namespace DoctorAIBolit.Services;

public interface IStripeService
{
    Task<string> CreateCheckoutSessionAsync(string visitorId, string priceId, int? credits = null);
    Task<bool> HandleWebhookAsync(string json, string signature);
}

