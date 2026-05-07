using DoctorAIBolit.Models;

namespace DoctorAIBolit.Services;

public interface IAdminService
{
    Task<bool> ValidateAdminKeyAsync(string adminKey);
    Task<List<Visitor>> GetAllVisitorsAsync();
    Task<List<AdminUserSummary>> GetEnrichedUsersAsync();
    Task<AdminDashboardSummary> GetDashboardSummaryAsync();
    Task<Visitor?> GetVisitorByIdAsync(string visitorId);
    Task<List<AdminUsageTimelineEntry>> GetUsageTimelineAsync(string visitorId);
    Task<Visitor?> AddCreditsAsync(string visitorId, int credits);
    Task<Visitor?> ResetCreditsAsync(string visitorId);
    Task<Visitor?> ResetVisitorAsync(string visitorId);
    Task<Visitor?> ResetMessageCountAsync(string visitorId, int? resetTo = null);
    Task<Visitor?> MarkPremiumAsync(string visitorId, bool isPremium = true);
    Task<List<PaymentHistory>> GetPaymentHistoryAsync(string? visitorId = null);
}

