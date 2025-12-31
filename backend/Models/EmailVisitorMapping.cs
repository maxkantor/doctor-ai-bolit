using Amazon.DynamoDBv2.DataModel;

namespace DoctorAIBolit.Models;

[DynamoDBTable("EmailVisitorMapping")]
public class EmailVisitorMapping
{
    [DynamoDBHashKey]
    public string Email { get; set; } = string.Empty; // Normalized email (lowercase)
    
    [DynamoDBRangeKey]
    public string VisitorId { get; set; } = string.Empty;
    
    public DateTime FirstLinkedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastLinkedAt { get; set; } = DateTime.UtcNow;
    public bool IsVerified { get; set; } = false; // Email verification status
    public string? VerificationCode { get; set; } // For email verification
    public DateTime? VerificationCodeExpiresAt { get; set; }
}
