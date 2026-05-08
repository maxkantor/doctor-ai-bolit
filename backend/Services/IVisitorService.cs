using DoctorAIBolit.Models;

namespace DoctorAIBolit.Services;

public interface IVisitorService
{
    Task<Visitor> GetOrCreateVisitorAsync(string visitorId, string? referralSource = null);
    /// <summary>Persists LastActive so CRM shows recent visitors even when no message was sent.</summary>
    Task RecordVisitorActivityAsync(string visitorId, CancellationToken cancellationToken = default);
    Task<bool> CanSendMessageAsync(string visitorId);
    Task<int> GetRemainingMessagesAsync(string visitorId);
    Task<int> GetRemainingCreditsAsync(string visitorId);
    Task<bool> DeductCreditAsync(string visitorId);
    Task AddCreditsAsync(string visitorId, int credits);
    Task<int> GetFreeMessageLimitAsync();
}

