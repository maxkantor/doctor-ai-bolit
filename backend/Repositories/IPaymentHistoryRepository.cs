using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public interface IPaymentHistoryRepository
{
    Task SavePaymentAsync(PaymentHistory payment);
    Task<List<PaymentHistory>> GetPaymentsByVisitorIdAsync(string visitorId);
    Task<PaymentHistory?> GetPaymentByIdAsync(string paymentId, string visitorId);
    Task<List<PaymentHistory>> GetAllPaymentsAsync();
    Task<List<PaymentHistory>> GetPaymentsByEmailAsync(string email);
}

