using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public interface IContactRepository
{
    Task SaveContactMessageAsync(ContactMessage message);
    Task<List<ContactMessage>> GetAllContactMessagesAsync();
}

