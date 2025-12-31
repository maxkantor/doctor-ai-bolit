using Amazon.DynamoDBv2.DataModel;

namespace DoctorAIBolit.Models;

[DynamoDBTable("DoctorAibolitVisitorSessions")]
public class VisitorSession
{
    [DynamoDBHashKey]
    public string VisitorId { get; set; } = string.Empty;
    
    [DynamoDBRangeKey]
    public string SessionDate { get; set; } = string.Empty; // Format: YYYY-MM-DD
    
    public int MessagesUsed { get; set; } = 0;
    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

