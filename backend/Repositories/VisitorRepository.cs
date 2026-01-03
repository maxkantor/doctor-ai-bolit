using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public class VisitorRepository : IVisitorRepository
{
    private readonly IDynamoDBContext _context;
    private readonly IAmazonDynamoDB _dynamoDbClient;

    public VisitorRepository(IAmazonDynamoDB dynamoDbClient)
    {
        _dynamoDbClient = dynamoDbClient;
        var config = new DynamoDBContextConfig
        {
            DisableFetchingTableMetadata = true
        };
        _context = new DynamoDBContext(dynamoDbClient, config);
    }

    public async Task<Visitor?> GetVisitorAsync(string visitorId)
    {
        try
        {
            Console.WriteLine($"[VisitorRepository.GetVisitorAsync] Looking up visitor: {visitorId}");
            var visitor = await _context.LoadAsync<Visitor>(visitorId);
            if (visitor == null)
            {
                Console.WriteLine($"[VisitorRepository.GetVisitorAsync] Visitor not found in database: {visitorId}");
            }
            else
            {
                Console.WriteLine($"[VisitorRepository.GetVisitorAsync] Visitor found: {visitorId}, CreditBalance={visitor.CreditBalance}, MessageCount={visitor.MessageCount}");
            }
            return visitor;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VisitorRepository.GetVisitorAsync] Error loading visitor {visitorId}: {ex.Message}");
            Console.WriteLine($"[VisitorRepository.GetVisitorAsync] Exception type: {ex.GetType().Name}");
            return null;
        }
    }

    public async Task<Visitor> CreateVisitorAsync(string visitorId, string? referralSource = null)
    {
        var visitor = new Visitor
        {
            VisitorId = visitorId,
            CreatedAt = DateTime.UtcNow,
            MessageCount = 0,
            CreditBalance = 0,
            IsPremium = false,
            LastActive = DateTime.UtcNow,
            ReferralSource = referralSource
        };

        await _context.SaveAsync(visitor);
        return visitor;
    }

    public async Task UpdateVisitorAsync(Visitor visitor)
    {
        visitor.LastActive = DateTime.UtcNow;
        await _context.SaveAsync(visitor);
    }

    public async Task IncrementMessageCountAsync(string visitorId)
    {
        var visitor = await GetVisitorAsync(visitorId);
        if (visitor != null)
        {
            visitor.MessageCount++;
            visitor.LastActive = DateTime.UtcNow;
            await UpdateVisitorAsync(visitor);
        }
    }

    public async Task<Visitor> GetOrCreateVisitorAsync(string visitorId, string? referralSource = null)
    {
        var visitor = await GetVisitorAsync(visitorId);
        if (visitor == null)
        {
            visitor = await CreateVisitorAsync(visitorId, referralSource);
        }
        return visitor;
    }

    public async Task<List<Visitor>> GetAllVisitorsAsync()
    {
        try
        {
            Console.WriteLine($"[GetAllVisitorsAsync] Starting scan of Visitors table");
            
            // Use ScanAsync with GetRemainingAsync - this automatically handles pagination
            var scan = _context.ScanAsync<Visitor>(new List<ScanCondition>());
            var visitors = await scan.GetRemainingAsync();
            
            Console.WriteLine($"[GetAllVisitorsAsync] Found {visitors.Count} visitors via context scan");
            
            // Sort by CreatedAt descending (newest first) for better UX
            visitors = visitors.OrderByDescending(v => v.CreatedAt).ToList();
            
            // Log sample of dates for debugging
            if (visitors.Count > 0)
            {
                var oldest = visitors.OrderBy(v => v.CreatedAt).First();
                var newest = visitors.OrderByDescending(v => v.CreatedAt).First();
                Console.WriteLine($"[GetAllVisitorsAsync] Date range: Oldest={oldest.CreatedAt:yyyy-MM-dd HH:mm:ss} UTC, Newest={newest.CreatedAt:yyyy-MM-dd HH:mm:ss} UTC");
                Console.WriteLine($"[GetAllVisitorsAsync] Sample visitor IDs: {string.Join(", ", visitors.Take(3).Select(v => $"{v.VisitorId.Substring(0, 8)}... (Created: {v.CreatedAt:yyyy-MM-dd})"))}");
            }
            else
            {
                Console.WriteLine($"[GetAllVisitorsAsync] No visitors found - this could be normal if no users have used the service yet");
            }
            
            Console.WriteLine($"[GetAllVisitorsAsync] Returning {visitors.Count} visitors (sorted by CreatedAt descending)");
            return visitors;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GetAllVisitorsAsync] Error scanning visitors: {ex.Message}");
            Console.WriteLine($"[GetAllVisitorsAsync] Exception type: {ex.GetType().Name}");
            Console.WriteLine($"[GetAllVisitorsAsync] Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[GetAllVisitorsAsync] Inner exception: {ex.InnerException.Message}");
            }
            return new List<Visitor>();
        }
    }
}

