using Amazon.DynamoDBv2.DataModel;

namespace DoctorAIBolit.Models;

[DynamoDBTable("DoctorAibolitVisitors")]
public class Visitor
{
    [DynamoDBHashKey]
    public string VisitorId { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    public int MessageCount { get; set; }
    public int CreditBalance { get; set; }
    public bool IsPremium { get; set; }
    public DateTime LastActive { get; set; }
    public string? ReferralSource { get; set; }
}

