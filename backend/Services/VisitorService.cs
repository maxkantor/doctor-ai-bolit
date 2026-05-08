using DoctorAIBolit.Models;
using DoctorAIBolit.Repositories;

namespace DoctorAIBolit.Services;

public class VisitorService : IVisitorService
{
    private readonly IVisitorRepository _visitorRepository;
    private readonly IVisitorSessionRepository _sessionRepository;
    private readonly IPricingConfigRepository _pricingConfigRepository;

    public VisitorService(
        IVisitorRepository visitorRepository,
        IVisitorSessionRepository sessionRepository,
        IPricingConfigRepository pricingConfigRepository)
    {
        _visitorRepository = visitorRepository;
        _sessionRepository = sessionRepository;
        _pricingConfigRepository = pricingConfigRepository;
    }

    public async Task<Visitor> GetOrCreateVisitorAsync(string visitorId, string? referralSource = null)
    {
        Console.WriteLine($"[VisitorService] GetOrCreateVisitorAsync called for visitorId: {visitorId}");
        var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
        if (visitor == null)
        {
            Console.WriteLine($"[VisitorService] Creating NEW visitor: {visitorId}");
            visitor = await _visitorRepository.CreateVisitorAsync(visitorId, referralSource);
            Console.WriteLine($"[VisitorService] ✅ Created visitor: {visitorId}, CreatedAt: {visitor.CreatedAt}");
        }
        else
        {
            Console.WriteLine($"[VisitorService] Found EXISTING visitor: {visitorId}, CreatedAt: {visitor.CreatedAt}, Credits: {visitor.CreditBalance}, Messages: {visitor.MessageCount}");
            // Only update LastActive, don't save unnecessarily (let the caller save if they make changes)
            visitor.LastActive = DateTime.UtcNow;
            // Note: We don't call UpdateVisitorAsync here to avoid unnecessary saves
            // The caller should save if they make modifications
        }
        return visitor;
    }

    public async Task RecordVisitorActivityAsync(string visitorId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var visitor = await _visitorRepository.GetOrCreateVisitorAsync(visitorId);
        visitor.LastActive = DateTime.UtcNow;
        await _visitorRepository.UpdateVisitorAsync(visitor);
    }

    private string GetSessionDate()
    {
        return DateTime.UtcNow.ToString("yyyy-MM-dd");
    }

    public async Task<bool> CanSendMessageAsync(string visitorId)
    {
        var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
        if (visitor == null) return true; // New visitor gets free messages

        if (visitor.IsPremium) return true; // Premium users have unlimited

        // Check if user has credits (purchased) or free messages remaining
        var remaining = await GetRemainingCreditsAsync(visitorId);
        return remaining > 0;
    }

    public async Task<int> GetRemainingCreditsAsync(string visitorId)
    {
        try
        {
            Console.WriteLine($"[GetRemainingCredits] Looking up visitor: {visitorId}");
            var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
            
            // Check if premium first
            if (visitor != null && visitor.IsPremium)
            {
                Console.WriteLine($"[GetRemainingCredits] Premium visitor: {visitorId}");
                return int.MaxValue;
            }
            
            // Get free message limit
            var config = await _pricingConfigRepository.GetConfigAsync();
            var freeLimit = config?.FreeMessageLimit ?? 5;
            
            if (visitor == null)
            {
                // New visitor - has all free messages
                Console.WriteLine($"[GetRemainingCredits] Visitor not found (new visitor): VisitorId={visitorId}, FreeLimit={freeLimit}");
                return freeLimit;
            }
            
            Console.WriteLine($"[GetRemainingCredits] Visitor found: VisitorId={visitorId}, CreditBalance={visitor.CreditBalance}, MessageCount={visitor.MessageCount}");
            
            // Calculate free messages remaining
            var freeMessagesUsed = Math.Min(visitor.MessageCount, freeLimit);
            var freeMessagesRemaining = Math.Max(0, freeLimit - freeMessagesUsed);
            
            // Total remaining = purchased credits + free messages remaining
            var totalRemaining = visitor.CreditBalance + freeMessagesRemaining;
            
            Console.WriteLine($"[GetRemainingCredits] CreditBalance={visitor.CreditBalance}, FreeMessagesRemaining={freeMessagesRemaining}, TotalRemaining={totalRemaining} for visitor {visitorId}");
            return totalRemaining;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GetRemainingCredits] Error: {ex.Message}");
            Console.WriteLine($"[GetRemainingCredits] Stack trace: {ex.StackTrace}");
            // Return default on error
            var config = await _pricingConfigRepository.GetConfigAsync();
            return config?.FreeMessageLimit ?? 5;
        }
    }

    private static readonly Dictionary<string, SemaphoreSlim> _deductionLocks = new Dictionary<string, SemaphoreSlim>();
    private static readonly object _lockDictionaryLock = new object();

    private SemaphoreSlim GetDeductionLock(string visitorId)
    {
        lock (_lockDictionaryLock)
        {
            if (!_deductionLocks.ContainsKey(visitorId))
            {
                _deductionLocks[visitorId] = new SemaphoreSlim(1, 1);
            }
            return _deductionLocks[visitorId];
        }
    }

    public async Task<bool> DeductCreditAsync(string visitorId)
    {
        var deductionId = Guid.NewGuid().ToString().Substring(0, 8);
        Console.WriteLine($"[DeductCredit-{deductionId}] START - VisitorId={visitorId}, ThreadId={Thread.CurrentThread.ManagedThreadId}");
        
        // Use a per-visitor lock to prevent concurrent deductions
        var semaphore = GetDeductionLock(visitorId);
        Console.WriteLine($"[DeductCredit-{deductionId}] Acquiring semaphore lock...");
        await semaphore.WaitAsync();
        Console.WriteLine($"[DeductCredit-{deductionId}] Semaphore lock acquired");
        
        try
        {
            // CRITICAL: Load visitor fresh from database to avoid stale data
            var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
            
            // If visitor doesn't exist, create it
            if (visitor == null)
            {
                visitor = await _visitorRepository.CreateVisitorAsync(visitorId);
                Console.WriteLine($"[DeductCredit] Created new visitor: {visitorId}");
            }
            
            // Log current state BEFORE deduction
            Console.WriteLine($"[DeductCredit] BEFORE - VisitorId={visitorId}, CreditBalance={visitor.CreditBalance}, MessageCount={visitor.MessageCount}");
            
            if (visitor.IsPremium) 
            {
                Console.WriteLine($"[DeductCredit] Premium user, no deduction needed");
                return true; // Premium users don't use credits
            }
            
            var config = await _pricingConfigRepository.GetConfigAsync();
            var freeLimit = config?.FreeMessageLimit ?? 5;
            
            // If user has purchased credits, deduct from those first
            // NOTE: MessageCount is NOT incremented when using purchased credits
            // MessageCount only tracks free messages used (for calculating free messages remaining)
            if (visitor.CreditBalance > 0)
            {
                var oldBalance = visitor.CreditBalance;
                visitor.CreditBalance--;
                visitor.LastActive = DateTime.UtcNow;
                
                // Save atomically
                await _visitorRepository.UpdateVisitorAsync(visitor);
                
                Console.WriteLine($"[DeductCredit-{deductionId}] AFTER - VisitorId={visitorId}, CreditBalance: {oldBalance} -> {visitor.CreditBalance}, MessageCount: {visitor.MessageCount} (unchanged - using purchased credits)");
                Console.WriteLine($"[DeductCredit-{deductionId}] Releasing semaphore lock");
                return true;
            }
            
            // Otherwise, check if they have free messages left
            var freeMessagesUsed = Math.Min(visitor.MessageCount, freeLimit);
            if (freeMessagesUsed >= freeLimit)
            {
                Console.WriteLine($"[DeductCredit-{deductionId}] VisitorId={visitorId}, No free messages remaining (MessageCount={visitor.MessageCount}, FreeLimit={freeLimit})");
                Console.WriteLine($"[DeductCredit-{deductionId}] Releasing semaphore lock");
                return false; // No free messages left
            }
            
            // Deduct from free messages
            var oldFreeMessageCount = visitor.MessageCount;
            visitor.MessageCount++;
            visitor.LastActive = DateTime.UtcNow;
            await _visitorRepository.UpdateVisitorAsync(visitor);
            Console.WriteLine($"[DeductCredit-{deductionId}] AFTER - VisitorId={visitorId}, Deducted from free messages, MessageCount: {oldFreeMessageCount} -> {visitor.MessageCount}");
            Console.WriteLine($"[DeductCredit-{deductionId}] Releasing semaphore lock");
            return true;
        }
        finally
        {
            semaphore.Release();
            Console.WriteLine($"[DeductCredit-{deductionId}] Semaphore lock released in finally block");
        }
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

    // Legacy method for backward compatibility
    public async Task<int> GetRemainingMessagesAsync(string visitorId)
    {
        return await GetRemainingCreditsAsync(visitorId);
    }

    public async Task<int> GetFreeMessageLimitAsync()
    {
        var config = await _pricingConfigRepository.GetConfigAsync();
        return config?.FreeMessageLimit ?? 5;
    }
}

