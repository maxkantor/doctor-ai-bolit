using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;

namespace DoctorAIBolit.Services;

public class EmailService : IEmailService
{
    private readonly IAmazonSimpleEmailService _ses;
    private readonly SecretsService _secretsService;
    private readonly IConfiguration _configuration;
    private string? _fromEmail;
    private string? _adminEmail;

    public EmailService(IAmazonSimpleEmailService ses, SecretsService secretsService, IConfiguration configuration)
    {
        _ses = ses;
        _secretsService = secretsService;
        _configuration = configuration;
    }

    private async Task<string> GetFromEmailAsync()
    {
        if (_fromEmail == null)
        {
            // First check environment variables (Lambda configuration)
            _fromEmail = _configuration["SES_FROM_EMAIL"] 
                ?? Environment.GetEnvironmentVariable("SES_FROM_EMAIL");
            
            // If not in environment variables, check Secrets Manager
            if (string.IsNullOrWhiteSpace(_fromEmail))
            {
                var secrets = await _secretsService.GetSecretsAsync();
                _fromEmail = secrets.FromEmail;
                Console.WriteLine($"[EmailService] Using FROM_EMAIL from Secrets Manager: {_fromEmail}");
            }
            else
            {
                Console.WriteLine($"[EmailService] Using FROM_EMAIL from environment variable: {_fromEmail}");
            }
        }
        return _fromEmail;
    }

    private async Task<string> GetAdminEmailAsync()
    {
        if (_adminEmail == null)
        {
            // First check environment variables (Lambda configuration)
            _adminEmail = _configuration["SES_ADMIN_EMAIL"] 
                ?? Environment.GetEnvironmentVariable("SES_ADMIN_EMAIL");
            
            // If not in environment variables, check Secrets Manager
            if (string.IsNullOrWhiteSpace(_adminEmail))
            {
                var secrets = await _secretsService.GetSecretsAsync();
                _adminEmail = secrets.AdminEmail;
                Console.WriteLine($"[EmailService] Using ADMIN_EMAIL from Secrets Manager: {_adminEmail}");
            }
            else
            {
                Console.WriteLine($"[EmailService] Using ADMIN_EMAIL from environment variable: {_adminEmail}");
            }
        }
        return _adminEmail;
    }

    public async Task SendContactNotificationAsync(string name, string email, string message)
    {
        var fromEmail = await GetFromEmailAsync();
        var adminEmail = await GetAdminEmailAsync();
        
        var request = new SendEmailRequest
        {
            Source = fromEmail,
            Destination = new Destination
            {
                ToAddresses = new List<string> { adminEmail }
            },
            Message = new Message
            {
                Subject = new Content($"New Contact Form Submission from {name}"),
                Body = new Body
                {
                    Text = new Content($"Name: {name}\nEmail: {email}\n\nMessage:\n{message}")
                }
            }
        };

        await _ses.SendEmailAsync(request);
    }

    public async Task SendEmailReplyAsync(string to, string subject, string body)
    {
        try
        {
            Console.WriteLine($"[EmailService] Sending reply email to: {to}, Subject: {subject}");
            
            if (string.IsNullOrWhiteSpace(to))
            {
                throw new ArgumentException("Recipient email address is required", nameof(to));
            }
            
            if (string.IsNullOrWhiteSpace(subject))
            {
                throw new ArgumentException("Email subject is required", nameof(subject));
            }
            
            if (string.IsNullOrWhiteSpace(body))
            {
                throw new ArgumentException("Email body is required", nameof(body));
            }

            var fromEmail = await GetFromEmailAsync();
            Console.WriteLine($"[EmailService] Using FROM_EMAIL: {fromEmail}");
            
            var request = new SendEmailRequest
            {
                Source = fromEmail,
                Destination = new Destination
                {
                    ToAddresses = new List<string> { to }
                },
                Message = new Message
                {
                    Subject = new Content(subject),
                    Body = new Body
                    {
                        Text = new Content(body)
                    }
                }
            };

            var response = await _ses.SendEmailAsync(request);
            Console.WriteLine($"[EmailService] Email sent successfully. MessageId: {response.MessageId}");
        }
        catch (Amazon.SimpleEmail.Model.MessageRejectedException ex)
        {
            Console.WriteLine($"[EmailService] Message rejected: {ex.Message}");
            throw new Exception($"Email rejected: {ex.Message}. Please verify the recipient email address and ensure SES is properly configured.", ex);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailService] Error sending email: {ex.Message}");
            Console.WriteLine($"[EmailService] Stack trace: {ex.StackTrace}");
            throw new Exception($"Failed to send email: {ex.Message}", ex);
        }
    }

    public async Task SendPaymentConfirmationAsync(string to, string customerName, decimal amount, int credits, string planName)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(to) || !IsValidEmail(to))
            {
                Console.WriteLine($"[EmailService] Invalid email address for payment confirmation: {to}");
                return; // Don't throw, just log - email might not be available
            }

            var fromEmail = await GetFromEmailAsync();
            var subject = "Payment Confirmation - DoctorAibolit";
            var body = $@"Hello {(string.IsNullOrWhiteSpace(customerName) ? "there" : customerName)},

Thank you for your purchase!

Payment Details:
- Plan: {planName}
- Amount: ${amount:F2}
- Credits Added: {credits} messages

Your account has been credited with {credits} messages. You can now continue your conversations with full access to our AI support.

If you have any questions or need assistance, please don't hesitate to reach out.

Best regards,
The DoctorAibolit Team

---
This is an automated confirmation email. Please do not reply to this message.";

            var request = new SendEmailRequest
            {
                Source = fromEmail,
                Destination = new Destination
                {
                    ToAddresses = new List<string> { to }
                },
                Message = new Message
                {
                    Subject = new Content(subject),
                    Body = new Body
                    {
                        Text = new Content(body)
                    }
                }
            };

            var response = await _ses.SendEmailAsync(request);
            Console.WriteLine($"[EmailService] Payment confirmation email sent to {to}. MessageId: {response.MessageId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailService] Error sending payment confirmation email: {ex.Message}");
            // Don't throw - payment should still succeed even if email fails
        }
    }

    public async Task SendPaymentNotificationToAdminAsync(string visitorId, string customerEmail, decimal amount, int credits, string planName, string stripeSessionId)
    {
        try
        {
            var fromEmail = await GetFromEmailAsync();
            var adminEmail = await GetAdminEmailAsync();
            
            var subject = $"New Payment Received - {planName}";
            var body = $@"New payment received:

Visitor ID: {visitorId}
Customer Email: {customerEmail ?? "Not provided"}
Plan: {planName}
Amount: ${amount:F2}
Credits: {credits} messages
Stripe Session ID: {stripeSessionId}
Payment Date: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC

This payment has been processed and credits have been added to the user's account.";

            var request = new SendEmailRequest
            {
                Source = fromEmail,
                Destination = new Destination
                {
                    ToAddresses = new List<string> { adminEmail }
                },
                Message = new Message
                {
                    Subject = new Content(subject),
                    Body = new Body
                    {
                        Text = new Content(body)
                    }
                }
            };

            var response = await _ses.SendEmailAsync(request);
            Console.WriteLine($"[EmailService] Payment notification sent to admin. MessageId: {response.MessageId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailService] Error sending payment notification to admin: {ex.Message}");
            // Don't throw - payment should still succeed even if admin email fails
        }
    }

    private bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    public async Task SendVerificationCodeAsync(string email, string code)
    {
        try
        {
            var fromEmail = await GetFromEmailAsync();
            var subject = "Your AnxietyChatAI Verification Code";
            var body = $@"Hello,

You requested to restore your credits on AnxietyChatAI.

Your verification code is: {code}

This code will expire in 15 minutes.

If you didn't request this code, please ignore this email.

Best regards,
AnxietyChatAI Team";

            var request = new SendEmailRequest
            {
                Source = fromEmail,
                Destination = new Destination
                {
                    ToAddresses = new List<string> { email }
                },
                Message = new Message
                {
                    Subject = new Content(subject),
                    Body = new Body
                    {
                        Text = new Content(body)
                    }
                }
            };

            var response = await _ses.SendEmailAsync(request);
            Console.WriteLine($"[EmailService] Verification code email sent to: {email}, MessageId: {response.MessageId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailService] Error sending verification code email: {ex.Message}");
            throw;
        }
    }
}

