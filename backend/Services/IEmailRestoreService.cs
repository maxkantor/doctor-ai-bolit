namespace DoctorAIBolit.Services;

public interface IEmailRestoreService
{
    Task<string> SendVerificationCodeAsync(string email);
    Task<EmailRestoreResult> VerifyAndRestoreCreditsAsync(string email, string verificationCode, string currentVisitorId);
}

public class EmailRestoreResult
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public int? TotalCreditsRestored { get; set; }
    public string? MergedVisitorId { get; set; }
}

