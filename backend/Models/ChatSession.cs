using Amazon.DynamoDBv2.DataModel;

namespace DoctorAIBolit.Models;

[DynamoDBTable("DoctorAibolitChatSessions")]
public class ChatSession
{
    [DynamoDBHashKey]
    public string VisitorId { get; set; } = string.Empty;
    
    [DynamoDBRangeKey]
    public string SessionId { get; set; } = string.Empty;
    
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

