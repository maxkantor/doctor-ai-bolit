namespace DoctorAIBolit.Services;

public interface IEmailService
{
    Task SendContactNotificationAsync(string name, string email, string message);
    Task SendEmailReplyAsync(string to, string subject, string body);
    Task SendPaymentConfirmationAsync(string to, string customerName, decimal amount, int credits, string planName);
    Task SendPaymentNotificationToAdminAsync(string visitorId, string customerEmail, decimal amount, int credits, string planName, string stripeSessionId);
    Task SendVerificationCodeAsync(string email, string code);
}

