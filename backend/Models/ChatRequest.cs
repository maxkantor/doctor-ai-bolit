namespace DoctorAIBolit.Models;

public class ChatRequest
{
    public string VisitorId { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? SystemPrompt { get; set; }
}

