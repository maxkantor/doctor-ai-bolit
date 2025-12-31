using DoctorAIBolit.Models;
using DoctorAIBolit.Repositories;

namespace DoctorAIBolit.Services;

public class AdminService : IAdminService
{
    private readonly SecretsService _secretsService;
    private readonly IVisitorRepository _visitorRepository;
    private readonly IVisitorSessionRepository _visitorSessionRepository;
    private readonly IPricingConfigRepository _pricingConfigRepository;
    private readonly IPaymentHistoryRepository _paymentHistoryRepository;

    public AdminService(
        SecretsService secretsService,
        IVisitorRepository visitorRepository,
        IVisitorSessionRepository visitorSessionRepository,
        IPricingConfigRepository pricingConfigRepository,
        IPaymentHistoryRepository paymentHistoryRepository)
    {
        _secretsService = secretsService;
        _visitorRepository = visitorRepository;
        _visitorSessionRepository = visitorSessionRepository;
        _pricingConfigRepository = pricingConfigRepository;
        _paymentHistoryRepository = paymentHistoryRepository;
    }

    public async Task<bool> ValidateAdminKeyAsync(string adminKey)
    {
        if (string.IsNullOrWhiteSpace(adminKey))
        {
            return false;
        }

        var secrets = await _secretsService.GetSecretsAsync();
        if (string.IsNullOrWhiteSpace(secrets.AdminSecret))
        {
            return false;
        }

        // Trim both values and compare (case-sensitive)
        return adminKey.Trim() == secrets.AdminSecret.Trim();
    }

    public async Task<List<Visitor>> GetAllVisitorsAsync()
    {
        return await _visitorRepository.GetAllVisitorsAsync();
    }

    public async Task<Visitor?> GetVisitorByIdAsync(string visitorId)
    {
        return await _visitorRepository.GetVisitorAsync(visitorId);
    }

    public async Task AddCreditsAsync(string visitorId, int credits)
    {
        var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
        if (visitor != null)
        {
            visitor.CreditBalance += credits;
            await _visitorRepository.UpdateVisitorAsync(visitor);
        }
    }

    public async Task ResetVisitorAsync(string visitorId)
    {
        var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
        if (visitor != null)
        {
            visitor.MessageCount = 0;
            visitor.CreditBalance = 0;
            visitor.IsPremium = false;
            await _visitorRepository.UpdateVisitorAsync(visitor);
        }
    }

    public async Task ResetMessageCountAsync(string visitorId, int? resetTo = null)
    {
        var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
        if (visitor == null)
        {
            Console.WriteLine($"[AdminService] Visitor not found: {visitorId}");
            return;
        }
        
        var config = await _pricingConfigRepository.GetConfigAsync();
        var freeLimit = config?.FreeMessageLimit ?? 5;
        
        if (resetTo.HasValue)
        {
            // If resetTo is 5 (or equals freeLimit), reset everything to free tier
            if (resetTo.Value == freeLimit)
            {
                // Full reset to free tier: clear credits and reset message count
                var oldCredits = visitor.CreditBalance;
                visitor.CreditBalance = 0;
                visitor.MessageCount = 0;
                Console.WriteLine($"[AdminService] Full reset to free tier (5 messages) - cleared {oldCredits} credits and reset message count to 0 for visitor: {visitorId}");
            }
            else
            {
                // Reset to specific number (e.g., if user purchased something)
                // Calculate how many messages were used based on the reset value
                // If resetTo is 0, that means 5 messages used (0 free messages remaining)
                var messagesUsed = Math.Max(0, freeLimit - resetTo.Value);
                
                visitor.MessageCount = messagesUsed;
                // Don't clear credits when resetting to a non-free-limit value
                Console.WriteLine($"[AdminService] Reset message count to {resetTo.Value} (messages used: {messagesUsed}) for visitor: {visitorId}. Credits unchanged: {visitor.CreditBalance}");
            }
        }
        else
        {
            // Reset to blank = full reset to free limit - clear credits and reset message count
            visitor.CreditBalance = 0;
            visitor.MessageCount = 0;
            Console.WriteLine($"[AdminService] Full reset to free tier (blank reset) - cleared credits and reset message count to 0 for visitor: {visitorId}");
        }
        
        await _visitorRepository.UpdateVisitorAsync(visitor);
    }

    public async Task<List<PaymentHistory>> GetPaymentHistoryAsync(string? visitorId = null)
    {
        if (!string.IsNullOrWhiteSpace(visitorId))
        {
            return await _paymentHistoryRepository.GetPaymentsByVisitorIdAsync(visitorId);
        }
        
        // Return all payments if no visitorId specified
        Console.WriteLine("[AdminService] GetPaymentHistoryAsync called without visitorId - returning all payments");
        return await _paymentHistoryRepository.GetAllPaymentsAsync();
    }
}

