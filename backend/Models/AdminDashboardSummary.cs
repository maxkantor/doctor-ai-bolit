namespace DoctorAIBolit.Models;

public class AdminDashboardSummary
{
    public int TotalUsers { get; set; }
    public int ActiveLast24Hours { get; set; }
    public int PayingUsers { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal ConversionRatePercent { get; set; }
    public decimal AverageMessagesBeforePayment { get; set; }
    public int UsersUsedAllFreeCredits { get; set; }
    public int FunnelVisited { get; set; }
    public int FunnelStartedChat { get; set; }
    public int FunnelUsedFreeCredits { get; set; }
    public int FunnelPaid { get; set; }
    public int ContactMessagesCount { get; set; }
    public int PhotoCheckUsageCount { get; set; }
    public List<PaymentHistory> RecentTransactions { get; set; } = new();
}
