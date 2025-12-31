using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public interface IVisitorRepository
{
    Task<Visitor?> GetVisitorAsync(string visitorId);
    Task<Visitor> CreateVisitorAsync(string visitorId, string? referralSource = null);
    Task UpdateVisitorAsync(Visitor visitor);
    Task IncrementMessageCountAsync(string visitorId);
    Task<Visitor> GetOrCreateVisitorAsync(string visitorId, string? referralSource = null);
    Task<List<Visitor>> GetAllVisitorsAsync();
}

