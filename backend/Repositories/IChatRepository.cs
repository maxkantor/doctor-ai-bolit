using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public interface IChatRepository
{
    Task<List<ChatSession>> GetSessionsAsync(string visitorId);
    Task<ChatSession> CreateSessionAsync(string visitorId, string sessionId, string title);
    Task<List<ChatMessage>> GetMessagesAsync(string sessionId);
    Task SaveMessageAsync(ChatMessage message);
}

