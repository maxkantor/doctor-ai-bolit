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
    private readonly IChatRepository _chatRepository;
    private readonly IEmailVisitorMappingRepository _emailVisitorMappingRepository;

    public AdminService(
        SecretsService secretsService,
        IVisitorRepository visitorRepository,
        IVisitorSessionRepository visitorSessionRepository,
        IPricingConfigRepository pricingConfigRepository,
        IPaymentHistoryRepository paymentHistoryRepository,
        IChatRepository chatRepository,
        IEmailVisitorMappingRepository emailVisitorMappingRepository)
    {
        _secretsService = secretsService;
        _visitorRepository = visitorRepository;
        _visitorSessionRepository = visitorSessionRepository;
        _pricingConfigRepository = pricingConfigRepository;
        _paymentHistoryRepository = paymentHistoryRepository;
        _chatRepository = chatRepository;
        _emailVisitorMappingRepository = emailVisitorMappingRepository;
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

    public async Task<List<AdminUserSummary>> GetEnrichedUsersAsync()
    {
        var visitors = await _visitorRepository.GetAllVisitorsAsync();
        var payments = await _paymentHistoryRepository.GetAllPaymentsAsync();
        var config = await _pricingConfigRepository.GetConfigAsync();
        var freeLimit = config?.FreeMessageLimit ?? 5;

        var summaries = new List<AdminUserSummary>(visitors.Count);

        foreach (var visitor in visitors)
        {
            var userPayments = payments
                .Where(p => p.VisitorId == visitor.VisitorId && string.Equals(p.Status, "completed", StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(p => p.PaymentDate)
                .ToList();

            var totalSpent = userPayments.Sum(p => p.Amount);
            var creditsPurchased = userPayments.Sum(p => p.Credits);
            var paymentEmail = userPayments
                .Select(p => p.CustomerEmail)
                .FirstOrDefault(e => !string.IsNullOrWhiteSpace(e));

            string? mappedEmail = paymentEmail;
            if (string.IsNullOrWhiteSpace(mappedEmail))
            {
                var mappings = await _emailVisitorMappingRepository.GetEmailsByVisitorIdAsync(visitor.VisitorId);
                mappedEmail = mappings
                    .OrderByDescending(m => m.LastLinkedAt)
                    .Select(m => m.Email)
                    .FirstOrDefault(e => !string.IsNullOrWhiteSpace(e));
            }

            var sessions = await _chatRepository.GetSessionsAsync(visitor.VisitorId);
            var allUserMessages = new List<ChatMessage>();
            foreach (var session in sessions)
            {
                var messages = await _chatRepository.GetMessagesAsync(session.SessionId);
                allUserMessages.AddRange(messages.Where(m => string.Equals(m.Role, "user", StringComparison.OrdinalIgnoreCase)));
            }

            var latestSession = sessions.FirstOrDefault();
            var lastSessionMessages = 0;
            if (latestSession != null)
            {
                var lastMessages = await _chatRepository.GetMessagesAsync(latestSession.SessionId);
                lastSessionMessages = lastMessages.Count(m => string.Equals(m.Role, "user", StringComparison.OrdinalIgnoreCase));
            }

            var photoCheckCount = allUserMessages.Count(m => string.Equals(m.MessageType, "photo-check", StringComparison.OrdinalIgnoreCase));

            summaries.Add(new AdminUserSummary
            {
                VisitorId = visitor.VisitorId,
                CreatedAt = visitor.CreatedAt,
                LastActive = visitor.LastActive,
                MessageCount = visitor.MessageCount,
                CreditBalance = visitor.CreditBalance,
                IsPremium = visitor.IsPremium,
                Email = mappedEmail,
                TotalSpent = totalSpent,
                CreditsPurchased = creditsPurchased,
                ConversionStatus = GetConversionStatus(totalSpent, visitor.MessageCount, freeLimit, visitor.IsPremium),
                LastSessionMessages = lastSessionMessages,
                PhotoCheckCount = photoCheckCount
            });
        }

        return summaries.OrderByDescending(s => s.LastActive).ToList();
    }

    public async Task<AdminDashboardSummary> GetDashboardSummaryAsync()
    {
        var users = await GetEnrichedUsersAsync();
        var payments = (await _paymentHistoryRepository.GetAllPaymentsAsync())
            .Where(p => string.Equals(p.Status, "completed", StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(p => p.PaymentDate)
            .ToList();
        var config = await _pricingConfigRepository.GetConfigAsync();
        var freeLimit = config?.FreeMessageLimit ?? 5;

        var totalUsers = users.Count;
        var activeLast24Hours = users.Count(u => DateTime.UtcNow - u.LastActive <= TimeSpan.FromHours(24));
        var payingUsers = users.Count(u => u.TotalSpent > 0 || u.IsPremium);
        var totalRevenue = payments.Sum(p => p.Amount);
        var conversionRatePercent = totalUsers > 0 ? Math.Round((decimal)payingUsers / totalUsers * 100m, 1) : 0m;

        var convertedUsers = users.Where(u => u.TotalSpent > 0 || u.IsPremium).ToList();
        var averageMessagesBeforePayment = convertedUsers.Count > 0
            ? Math.Round((decimal)convertedUsers.Average(u => u.MessageCount), 1)
            : 0m;

        var usersUsedAllFreeCredits = users.Count(u => u.MessageCount >= freeLimit);

        return new AdminDashboardSummary
        {
            TotalUsers = totalUsers,
            ActiveLast24Hours = activeLast24Hours,
            PayingUsers = payingUsers,
            TotalRevenue = totalRevenue,
            ConversionRatePercent = conversionRatePercent,
            AverageMessagesBeforePayment = averageMessagesBeforePayment,
            UsersUsedAllFreeCredits = usersUsedAllFreeCredits,
            FunnelVisited = totalUsers,
            FunnelStartedChat = users.Count(u => u.MessageCount > 0),
            FunnelUsedFreeCredits = usersUsedAllFreeCredits,
            FunnelPaid = payingUsers,
            PhotoCheckUsageCount = users.Sum(u => u.PhotoCheckCount),
            RecentTransactions = payments.Take(10).ToList()
        };
    }

    public async Task<Visitor?> GetVisitorByIdAsync(string visitorId)
    {
        return await _visitorRepository.GetVisitorAsync(visitorId);
    }

    public async Task<List<AdminUsageTimelineEntry>> GetUsageTimelineAsync(string visitorId)
    {
        var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
        if (visitor == null)
        {
            return new List<AdminUsageTimelineEntry>();
        }

        var config = await _pricingConfigRepository.GetConfigAsync();
        var freeLimit = config?.FreeMessageLimit ?? 5;

        var payments = (await _paymentHistoryRepository.GetPaymentsByVisitorIdAsync(visitorId))
            .Where(p => p.Credits > 0 && string.Equals(p.Status, "completed", StringComparison.OrdinalIgnoreCase))
            .OrderBy(p => p.PaymentDate)
            .ToList();

        var sessions = await _chatRepository.GetSessionsAsync(visitorId);
        var userMessages = new List<ChatMessage>();
        foreach (var session in sessions)
        {
            var messages = await _chatRepository.GetMessagesAsync(session.SessionId);
            userMessages.AddRange(messages.Where(m => string.Equals(m.Role, "user", StringComparison.OrdinalIgnoreCase)));
        }
        userMessages = userMessages.OrderBy(m => m.Timestamp).ToList();

        var timeline = new List<AdminUsageTimelineEntry>();
        var paidRemaining = 0;
        var freeUsed = 0;
        var messagesUsed = 0;
        var paymentIndex = 0;

        foreach (var message in userMessages)
        {
            while (paymentIndex < payments.Count && payments[paymentIndex].PaymentDate <= message.Timestamp)
            {
                var payment = payments[paymentIndex];
                paidRemaining += payment.Credits;
                timeline.Add(new AdminUsageTimelineEntry
                {
                    Timestamp = payment.PaymentDate,
                    EventType = "payment",
                    MessagesUsedCumulative = messagesUsed,
                    RemainingCredits = Math.Max(0, freeLimit - freeUsed) + paidRemaining,
                    DeltaCredits = payment.Credits,
                    Details = $"Purchased {payment.Credits} credits ({payment.PlanName})"
                });
                paymentIndex++;
            }

            messagesUsed++;
            if (paidRemaining > 0)
            {
                paidRemaining--;
            }
            else if (freeUsed < freeLimit)
            {
                freeUsed++;
            }

            var isPhotoCheck = string.Equals(message.MessageType, "photo-check", StringComparison.OrdinalIgnoreCase);
            timeline.Add(new AdminUsageTimelineEntry
            {
                Timestamp = message.Timestamp,
                EventType = isPhotoCheck ? "photo-check" : "message",
                MessagesUsedCumulative = messagesUsed,
                RemainingCredits = Math.Max(0, freeLimit - freeUsed) + paidRemaining,
                DeltaCredits = -1,
                Details = isPhotoCheck
                    ? $"AI Photo Check submitted. Question: {TruncateForAdmin(message.Content, 180)}"
                    : "User sent a message",
                QuestionText = isPhotoCheck ? message.Content : null,
                CreditsUsed = isPhotoCheck ? (message.CreditsUsed ?? 1) : 1
            });
        }

        while (paymentIndex < payments.Count)
        {
            var payment = payments[paymentIndex];
            paidRemaining += payment.Credits;
            timeline.Add(new AdminUsageTimelineEntry
            {
                Timestamp = payment.PaymentDate,
                EventType = "payment",
                MessagesUsedCumulative = messagesUsed,
                RemainingCredits = Math.Max(0, freeLimit - freeUsed) + paidRemaining,
                DeltaCredits = payment.Credits,
                Details = $"Purchased {payment.Credits} credits ({payment.PlanName})"
            });
            paymentIndex++;
        }

        return timeline.OrderByDescending(t => t.Timestamp).Take(80).ToList();
    }

    public async Task<Visitor?> AddCreditsAsync(string visitorId, int credits)
    {
        var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
        if (visitor == null)
        {
            Console.WriteLine($"[AdminService] Cannot add credits. Visitor not found: {visitorId}");
            return null;
        }

        visitor.CreditBalance += credits;
        visitor.TotalCreditsAdded += credits;
        visitor.LastActive = DateTime.UtcNow;
        await _visitorRepository.UpdateVisitorAsync(visitor);
        return visitor;
    }

    public async Task<Visitor?> ResetCreditsAsync(string visitorId)
    {
        var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
        if (visitor == null)
        {
            Console.WriteLine($"[AdminService] Cannot reset credits. Visitor not found: {visitorId}");
            return null;
        }

        visitor.CreditBalance = 0;
        visitor.LastActive = DateTime.UtcNow;
        await _visitorRepository.UpdateVisitorAsync(visitor);
        return visitor;
    }

    public async Task<Visitor?> ResetVisitorAsync(string visitorId)
    {
        var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
        if (visitor == null)
        {
            Console.WriteLine($"[AdminService] Cannot reset visitor. Visitor not found: {visitorId}");
            return null;
        }

        visitor.MessageCount = 0;
        visitor.CreditBalance = 0;
        visitor.IsPremium = false;
        visitor.LastActive = DateTime.UtcNow;
        await _visitorRepository.UpdateVisitorAsync(visitor);
        return visitor;
    }

    public async Task<Visitor?> ResetMessageCountAsync(string visitorId, int? resetTo = null)
    {
        var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
        if (visitor == null)
        {
            Console.WriteLine($"[AdminService] Visitor not found: {visitorId}");
            return null;
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
        
        visitor.LastActive = DateTime.UtcNow;
        await _visitorRepository.UpdateVisitorAsync(visitor);
        return visitor;
    }

    public async Task<Visitor?> MarkPremiumAsync(string visitorId, bool isPremium = true)
    {
        var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
        if (visitor == null)
        {
            Console.WriteLine($"[AdminService] Cannot update premium flag. Visitor not found: {visitorId}");
            return null;
        }

        visitor.IsPremium = isPremium;
        visitor.LastActive = DateTime.UtcNow;
        await _visitorRepository.UpdateVisitorAsync(visitor);
        return visitor;
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

    private static string GetConversionStatus(decimal totalSpent, int messageCount, int freeLimit, bool isPremium)
    {
        if (totalSpent > 0 || isPremium)
        {
            return "Converted";
        }

        if (messageCount >= freeLimit)
        {
            return "Used Free Only";
        }

        if (messageCount > 0)
        {
            return "Engaged";
        }

        return "New";
    }

    private static string TruncateForAdmin(string value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length <= maxLength)
        {
            return value;
        }

        return value.Substring(0, maxLength) + "...";
    }
}

