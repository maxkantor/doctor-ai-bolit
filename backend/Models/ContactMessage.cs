using Amazon.DynamoDBv2.DataModel;

namespace DoctorAIBolit.Models;

[DynamoDBTable("DoctorAibolitContactMessages")]
public class ContactMessage
{
    [DynamoDBHashKey]
    public string MessageId { get; set; } = string.Empty;
    
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = "new";
    public DateTime CreatedAt { get; set; }

    /// <summary>Optional browser visitor id from X-Visitor-Id for CRM correlation.</summary>
    public string? VisitorId { get; set; }

    /// <summary>null = legacy row; true after SES notify succeeds; false if notify failed (message still saved).</summary>
    public bool? EmailSent { get; set; }
}

