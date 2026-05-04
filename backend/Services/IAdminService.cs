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
    Task AddCreditsAsync(string visitorId, int credits);
    Task ResetCreditsAsync(string visitorId);
    Task ResetVisitorAsync(string visitorId);
    Task ResetMessageCountAsync(string visitorId, int? resetTo = null);
    Task MarkPremiumAsync(string visitorId, bool isPremium = true);
    Task<List<PaymentHistory>> GetPaymentHistoryAsync(string? visitorId = null);
}

