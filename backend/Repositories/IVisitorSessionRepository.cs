using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public interface IVisitorSessionRepository
{
    Task<VisitorSession?> GetSessionAsync(string visitorId, string sessionDate);
    Task<VisitorSession> GetOrCreateSessionAsync(string visitorId, string sessionDate);
    Task IncrementMessageCountAsync(string visitorId, string sessionDate);
    Task ResetSessionAsync(string visitorId, string sessionDate);
    Task SaveSessionAsync(VisitorSession session);
}

