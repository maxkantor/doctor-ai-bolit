namespace DoctorAIBolit.Models;

public class AdminUserSummary
{
    public string VisitorId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime LastActive { get; set; }
    public int MessageCount { get; set; }
    public int CreditBalance { get; set; }
    public bool IsPremium { get; set; }
    public string? Email { get; set; }
    public decimal TotalSpent { get; set; }
    public int CreditsPurchased { get; set; }
    public string ConversionStatus { get; set; } = "New";
    public int LastSessionMessages { get; set; }
}
