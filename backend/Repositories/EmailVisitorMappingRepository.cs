using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DoctorAIBolit.Models;
using System.Security.Cryptography;
using System.Text;

namespace DoctorAIBolit.Repositories;

public class EmailVisitorMappingRepository : IEmailVisitorMappingRepository
{
    private readonly IDynamoDBContext _context;

    public EmailVisitorMappingRepository(IAmazonDynamoDB dynamoDbClient)
    {
        var config = new DynamoDBContextConfig
        {
            DisableFetchingTableMetadata = true
        };
        _context = new DynamoDBContext(dynamoDbClient, config);
    }

    private string NormalizeEmail(string email)
    {
        return email?.Trim().ToLowerInvariant() ?? string.Empty;
    }

    public async Task LinkEmailToVisitorAsync(string email, string visitorId)
    {
        var normalizedEmail = NormalizeEmail(email);
        if (string.IsNullOrWhiteSpace(normalizedEmail) || string.IsNullOrWhiteSpace(visitorId))
        {
            return;
        }

        // Check if mapping already exists
        var existing = await _context.LoadAsync<EmailVisitorMapping>(normalizedEmail, visitorId);
        
        if (existing == null)
        {
            // Create new mapping
            var mapping = new EmailVisitorMapping
            {
                Email = normalizedEmail,
                VisitorId = visitorId,
                FirstLinkedAt = DateTime.UtcNow,
                LastLinkedAt = DateTime.UtcNow,
                IsVerified = false
            };
            await _context.SaveAsync(mapping);
            Console.WriteLine($"[EmailVisitorMapping] Created new mapping: {normalizedEmail} -> {visitorId}");
        }
        else
        {
            // Update existing mapping
            existing.LastLinkedAt = DateTime.UtcNow;
            await _context.SaveAsync(existing);
            Console.WriteLine($"[EmailVisitorMapping] Updated existing mapping: {normalizedEmail} -> {visitorId}");
        }
    }

    public async Task<List<EmailVisitorMapping>> GetVisitorIdsByEmailAsync(string email)
    {
        try
        {
            var normalizedEmail = NormalizeEmail(email);
            
            // Email is the hash key, so we can use Query instead of Scan (more efficient and doesn't require Scan permission)
            var query = _context.QueryAsync<EmailVisitorMapping>(normalizedEmail);
            var mappings = await query.GetRemainingAsync();
            Console.WriteLine($"[EmailVisitorMapping] Found {mappings.Count} visitor IDs for email: {normalizedEmail}");
            return mappings;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailVisitorMapping] Error getting visitor IDs for email {email}: {ex.Message}");
            return new List<EmailVisitorMapping>();
        }
    }

    public async Task<List<EmailVisitorMapping>> GetEmailsByVisitorIdAsync(string visitorId)
    {
        try
        {
            // Since VisitorId is the range key, we need to scan with filter
            var scanConditions = new List<ScanCondition>
            {
                new ScanCondition("VisitorId", ScanOperator.Equal, visitorId)
            };
            var scan = _context.ScanAsync<EmailVisitorMapping>(scanConditions);
            var mappings = await scan.GetRemainingAsync();
            Console.WriteLine($"[EmailVisitorMapping] Found {mappings.Count} emails for visitor: {visitorId}");
            return mappings;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailVisitorMapping] Error getting emails for visitor {visitorId}: {ex.Message}");
            return new List<EmailVisitorMapping>();
        }
    }

    public async Task<string> GenerateVerificationCodeAsync(string email)
    {
        var normalizedEmail = NormalizeEmail(email);
        var code = GenerateRandomCode();
        var expiresAt = DateTime.UtcNow.AddMinutes(15); // Code expires in 15 minutes

        // Get all mappings for this email and update them with verification code
        var mappings = await GetVisitorIdsByEmailAsync(normalizedEmail);
        
        foreach (var mapping in mappings)
        {
            mapping.VerificationCode = code;
            mapping.VerificationCodeExpiresAt = expiresAt;
            await _context.SaveAsync(mapping);
        }

        Console.WriteLine($"[EmailVisitorMapping] Generated verification code for email: {normalizedEmail}");
        return code;
    }

    public async Task<bool> VerifyEmailAsync(string email, string verificationCode)
    {
        var normalizedEmail = NormalizeEmail(email);
        var mappings = await GetVisitorIdsByEmailAsync(normalizedEmail);

        foreach (var mapping in mappings)
        {
            if (mapping.VerificationCode == verificationCode && 
                mapping.VerificationCodeExpiresAt.HasValue &&
                mapping.VerificationCodeExpiresAt.Value > DateTime.UtcNow)
            {
                // Mark as verified and clear verification code
                mapping.IsVerified = true;
                mapping.VerificationCode = null;
                mapping.VerificationCodeExpiresAt = null;
                await _context.SaveAsync(mapping);
                Console.WriteLine($"[EmailVisitorMapping] Email verified: {normalizedEmail} -> {mapping.VisitorId}");
                return true;
            }
        }

        Console.WriteLine($"[EmailVisitorMapping] Verification failed for email: {normalizedEmail}");
        return false;
    }

    private string GenerateRandomCode()
    {
        // Generate a 6-digit code
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }
}

