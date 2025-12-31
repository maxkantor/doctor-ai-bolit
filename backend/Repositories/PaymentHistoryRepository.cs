using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DoctorAIBolit.Models;
using System.Collections.Generic;

namespace DoctorAIBolit.Repositories;

public class PaymentHistoryRepository : IPaymentHistoryRepository
{
    private readonly IDynamoDBContext _context;

    public PaymentHistoryRepository(IAmazonDynamoDB dynamoDbClient)
    {
        var config = new DynamoDBContextConfig
        {
            DisableFetchingTableMetadata = true
        };
        _context = new DynamoDBContext(dynamoDbClient, config);
    }

    public async Task SavePaymentAsync(PaymentHistory payment)
    {
        try
        {
            await _context.SaveAsync(payment);
            Console.WriteLine($"[PaymentHistoryRepository] Saved payment: {payment.PaymentId} for visitor: {payment.VisitorId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PaymentHistoryRepository] Error saving payment: {ex.Message}");
            throw;
        }
    }

    public async Task<List<PaymentHistory>> GetPaymentsByVisitorIdAsync(string visitorId)
    {
        try
        {
            Console.WriteLine($"[PaymentHistoryRepository] Querying payments for visitor: {visitorId}");
            // Since VisitorId is the range key, we need to scan with a filter
            var scanConditions = new List<ScanCondition>
            {
                new ScanCondition("VisitorId", ScanOperator.Equal, visitorId)
            };
            var scan = _context.ScanAsync<PaymentHistory>(scanConditions);
            var payments = await scan.GetRemainingAsync();
            Console.WriteLine($"[PaymentHistoryRepository] Found {payments.Count} payments for visitor {visitorId}");
            return payments.OrderByDescending(p => p.PaymentDate).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PaymentHistoryRepository] Error getting payments for visitor {visitorId}: {ex.Message}");
            Console.WriteLine($"[PaymentHistoryRepository] Stack trace: {ex.StackTrace}");
            return new List<PaymentHistory>();
        }
    }

    public async Task<PaymentHistory?> GetPaymentByIdAsync(string paymentId, string visitorId)
    {
        try
        {
            return await _context.LoadAsync<PaymentHistory>(paymentId, visitorId);
        }
        catch
        {
            return null;
        }
    }

    public async Task<List<PaymentHistory>> GetAllPaymentsAsync()
    {
        try
        {
            Console.WriteLine($"[PaymentHistoryRepository] Starting scan of PaymentHistory table");
            var scan = _context.ScanAsync<PaymentHistory>(new List<ScanCondition>());
            var payments = await scan.GetRemainingAsync();
            Console.WriteLine($"[PaymentHistoryRepository] Found {payments.Count} payments");
            return payments.OrderByDescending(p => p.PaymentDate).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PaymentHistoryRepository] Error scanning payments: {ex.Message}");
            Console.WriteLine($"[PaymentHistoryRepository] Stack trace: {ex.StackTrace}");
            return new List<PaymentHistory>();
        }
    }

    public async Task<List<PaymentHistory>> GetPaymentsByEmailAsync(string email)
    {
        try
        {
            var normalizedEmail = email?.Trim().ToLowerInvariant() ?? string.Empty;
            Console.WriteLine($"[PaymentHistoryRepository] Querying payments for email: {normalizedEmail}");
            
            // Scan all payments and filter by email (since CustomerEmail is not a key)
            var scan = _context.ScanAsync<PaymentHistory>(new List<ScanCondition>());
            var allPayments = await scan.GetRemainingAsync();
            
            var paymentsWithEmail = allPayments
                .Where(p => !string.IsNullOrWhiteSpace(p.CustomerEmail) && 
                           p.CustomerEmail.Trim().ToLowerInvariant() == normalizedEmail)
                .ToList();
            
            Console.WriteLine($"[PaymentHistoryRepository] Found {paymentsWithEmail.Count} payment(s) for email: {normalizedEmail}");
            
            // Log details of found payments
            foreach (var payment in paymentsWithEmail)
            {
                Console.WriteLine($"[PaymentHistoryRepository] Payment: {payment.PaymentId}, VisitorId: {payment.VisitorId}, Amount: {payment.Amount}, Date: {payment.PaymentDate}, Email: {payment.CustomerEmail}");
            }
            
            return paymentsWithEmail.OrderByDescending(p => p.PaymentDate).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PaymentHistoryRepository] Error getting payments for email {email}: {ex.Message}");
            Console.WriteLine($"[PaymentHistoryRepository] Stack trace: {ex.StackTrace}");
            return new List<PaymentHistory>();
        }
    }
}

