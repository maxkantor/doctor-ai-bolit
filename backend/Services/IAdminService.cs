using DoctorAIBolit.Models;

namespace DoctorAIBolit.Services;

public interface IAdminService
{
    Task<bool> ValidateAdminKeyAsync(string adminKey);
    Task<List<Visitor>> GetAllVisitorsAsync();
    Task<Visitor?> GetVisitorByIdAsync(string visitorId);
    Task AddCreditsAsync(string visitorId, int credits);
    Task ResetVisitorAsync(string visitorId);
    Task ResetMessageCountAsync(string visitorId, int? resetTo = null);
    Task<List<PaymentHistory>> GetPaymentHistoryAsync(string? visitorId = null);
}

