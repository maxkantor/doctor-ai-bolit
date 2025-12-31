using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public interface IEmailVisitorMappingRepository
{
    Task LinkEmailToVisitorAsync(string email, string visitorId);
    Task<List<EmailVisitorMapping>> GetVisitorIdsByEmailAsync(string email);
    Task<List<EmailVisitorMapping>> GetEmailsByVisitorIdAsync(string visitorId);
    Task<bool> VerifyEmailAsync(string email, string verificationCode);
    Task<string> GenerateVerificationCodeAsync(string email);
}

