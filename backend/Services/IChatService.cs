using DoctorAIBolit.Models;

namespace DoctorAIBolit.Services;

public interface IChatService
{
    Task<ChatResponse> ProcessMessageAsync(ChatRequest request);
    Task<List<ChatSession>> GetSessionsAsync(string visitorId);
    Task<List<ChatMessage>> GetSessionMessagesAsync(string sessionId);
    IAsyncEnumerable<string> StreamMessageAsync(ChatRequest request, CancellationToken cancellationToken = default);
}

