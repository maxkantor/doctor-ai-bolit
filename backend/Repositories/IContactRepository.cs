using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public interface IContactRepository
{
    Task SaveContactMessageAsync(ContactMessage message);
    Task<List<ContactMessage>> GetAllContactMessagesAsync();
    Task<ContactMessage?> GetContactMessageByIdAsync(string messageId);
    Task UpdateContactMessageStatusAsync(string messageId, string status);
}

