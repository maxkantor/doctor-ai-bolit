namespace DoctorAIBolit.Models;

public class AdminUsageTimelineEntry
{
    public DateTime Timestamp { get; set; }
    public string EventType { get; set; } = string.Empty;
    public int MessagesUsedCumulative { get; set; }
    public int RemainingCredits { get; set; }
    public int DeltaCredits { get; set; }
    public string Details { get; set; } = string.Empty;
}
