using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly IDynamoDBContext _context;

    public ChatRepository(IAmazonDynamoDB dynamoDbClient)
    {
        var config = new DynamoDBContextConfig
        {
            DisableFetchingTableMetadata = true
        };
        _context = new DynamoDBContext(dynamoDbClient, config);
    }

    public async Task<List<ChatSession>> GetSessionsAsync(string visitorId)
    {
        try
        {
            Console.WriteLine($"[ChatRepository.GetSessionsAsync] Querying sessions for visitorId: {visitorId}");
            var sessions = await _context.QueryAsync<ChatSession>(visitorId).GetRemainingAsync();
            var orderedSessions = sessions.OrderByDescending(s => s.CreatedAt).ToList();
            Console.WriteLine($"[ChatRepository.GetSessionsAsync] Found {orderedSessions.Count} sessions for visitorId: {visitorId}");
            return orderedSessions;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ChatRepository.GetSessionsAsync] Error querying sessions: {ex.Message}");
            Console.WriteLine($"[ChatRepository.GetSessionsAsync] Stack trace: {ex.StackTrace}");
            return new List<ChatSession>();
        }
    }

    public async Task<ChatSession> CreateSessionAsync(string visitorId, string sessionId, string title)
    {
        var session = new ChatSession
        {
            VisitorId = visitorId,
            SessionId = sessionId,
            Title = title,
            CreatedAt = DateTime.UtcNow
        };

        await _context.SaveAsync(session);
        return session;
    }

    public async Task<List<ChatMessage>> GetMessagesAsync(string sessionId)
    {
        var messages = await _context.QueryAsync<ChatMessage>(sessionId).GetRemainingAsync();
        return messages.OrderBy(m => m.Timestamp).ToList();
    }

    public async Task SaveMessageAsync(ChatMessage message)
    {
        await _context.SaveAsync(message);
    }
}

