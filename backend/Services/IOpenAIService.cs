using DoctorAIBolit.Models;

namespace DoctorAIBolit.Services;

public interface IOpenAIService
{
    Task<string> GenerateResponseAsync(string userMessage, List<ChatMessage> conversationHistory, string? systemPrompt = null, CancellationToken cancellationToken = default);
    Task<string> GeneratePhotoGuidanceAsync(string userMessage, byte[] imageBytes, string imageContentType, List<ChatMessage> conversationHistory, string? imageUrl = null, CancellationToken cancellationToken = default);
    IAsyncEnumerable<string> StreamResponseAsync(string userMessage, List<ChatMessage> conversationHistory, string? systemPrompt = null, CancellationToken cancellationToken = default);
    bool DetectCrisis(string message);
    string GetCrisisResponse();
}

