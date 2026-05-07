using Amazon.DynamoDBv2.DataModel;

namespace DoctorAIBolit.Models;

[DynamoDBTable("DoctorAibolitChatMessages")]
public class ChatMessage
{
    [DynamoDBHashKey]
    public string SessionId { get; set; } = string.Empty;
    
    [DynamoDBRangeKey]
    public DateTime Timestamp { get; set; }
    
    public string Role { get; set; } = string.Empty; // "user" or "assistant"
    public string Content { get; set; } = string.Empty;
    public string? MessageType { get; set; }
    public string? ImageS3Key { get; set; }
    public string? ImageFileName { get; set; }
    public string? ImageContentType { get; set; }
    public long? ImageSizeBytes { get; set; }
    public int? CreditsUsed { get; set; }
}

