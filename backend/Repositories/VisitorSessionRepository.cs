using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public class VisitorSessionRepository : IVisitorSessionRepository
{
    private readonly IDynamoDBContext _context;

    public VisitorSessionRepository(IAmazonDynamoDB dynamoDbClient)
    {
        var config = new DynamoDBContextConfig
        {
            DisableFetchingTableMetadata = true
        };
        _context = new DynamoDBContext(dynamoDbClient, config);
    }

    public async Task<VisitorSession?> GetSessionAsync(string visitorId, string sessionDate)
    {
        try
        {
            return await _context.LoadAsync<VisitorSession>(visitorId, sessionDate);
        }
        catch
        {
            return null;
        }
    }

    public async Task<VisitorSession> GetOrCreateSessionAsync(string visitorId, string sessionDate)
    {
        var session = await GetSessionAsync(visitorId, sessionDate);
        if (session == null)
        {
            session = new VisitorSession
            {
                VisitorId = visitorId,
                SessionDate = sessionDate,
                MessagesUsed = 0,
                LastMessageAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            await _context.SaveAsync(session);
        }
        return session;
    }

    public async Task IncrementMessageCountAsync(string visitorId, string sessionDate)
    {
        try
        {
            // Get or create session
            var session = await GetOrCreateSessionAsync(visitorId, sessionDate);
            
            // Increment the count
            var oldCount = session.MessagesUsed;
            var newCount = oldCount + 1;
            session.MessagesUsed = newCount;
            session.LastMessageAt = DateTime.UtcNow;
            
            // Save the session - use SaveAsync which handles both insert and update
            await _context.SaveAsync(session);
            
            // Log for debugging (can be removed later)
            Console.WriteLine($"[VisitorSession] Incremented: VisitorId={visitorId}, SessionDate={sessionDate}, OldCount={oldCount}, NewCount={newCount}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VisitorSession] Error incrementing: {ex.Message}");
            throw;
        }
    }

    public async Task ResetSessionAsync(string visitorId, string sessionDate)
    {
        var session = await GetSessionAsync(visitorId, sessionDate);
        if (session != null)
        {
            session.MessagesUsed = 0;
            await _context.SaveAsync(session);
        }
    }

    public async Task SaveSessionAsync(VisitorSession session)
    {
        await _context.SaveAsync(session);
    }
}

