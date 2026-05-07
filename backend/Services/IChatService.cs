using DoctorAIBolit.Models;

namespace DoctorAIBolit.Services;

public interface IChatService
{
    Task<ChatResponse> ProcessMessageAsync(ChatRequest request);
    Task<ChatResponse> ProcessPhotoCheckAsync(ChatRequest request, PhotoCheckImageMetadata imageMetadata, byte[] imageBytes, string imageContentType, CancellationToken cancellationToken = default);
    Task<List<ChatSession>> GetSessionsAsync(string visitorId);
    Task<List<ChatMessage>> GetSessionMessagesAsync(string sessionId);
    IAsyncEnumerable<string> StreamMessageAsync(ChatRequest request, CancellationToken cancellationToken = default);
}

