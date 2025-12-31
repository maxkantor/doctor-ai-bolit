using DoctorAIBolit.Models;
using DoctorAIBolit.Repositories;
using System.Text;
using System.Linq;

namespace DoctorAIBolit.Services;

public class ChatService : IChatService
{
    private readonly IVisitorService _visitorService;
    private readonly IChatRepository _chatRepository;
    private readonly IVisitorRepository _visitorRepository;
    private readonly IOpenAIService _openAIService;
    private const string AffiliateLinkPlaceholder = "{{AFFILIATE_LINK}}";

    public ChatService(
        IVisitorService visitorService,
        IChatRepository chatRepository,
        IVisitorRepository visitorRepository,
        IOpenAIService openAIService)
    {
        _visitorService = visitorService;
        _chatRepository = chatRepository;
        _visitorRepository = visitorRepository;
        _openAIService = openAIService;
    }

    public async Task<ChatResponse> ProcessMessageAsync(ChatRequest request)
    {
        var requestId = Guid.NewGuid().ToString().Substring(0, 8);
        var messagePreview = string.IsNullOrEmpty(request.Message) ? "(empty)" : (request.Message.Length > 50 ? request.Message.Substring(0, 50) + "..." : request.Message);
        Console.WriteLine($"[ChatService-{requestId}] Processing message for visitor: {request.VisitorId}, session: {request.SessionId}, message: {messagePreview}");
        
        // Check if visitor can send message (has credits) - this loads visitor but doesn't modify it
        var canSend = await _visitorService.CanSendMessageAsync(request.VisitorId);
        if (!canSend)
        {
            var remainingCredits = await _visitorService.GetRemainingCreditsAsync(request.VisitorId);
            return new ChatResponse
            {
                Message = string.Empty,
                RemainingMessages = remainingCredits,
                RequiresPayment = true
            };
        }

        // Deduct credit for QUESTION (user message) only - this method handles loading, deducting, and saving atomically
        Console.WriteLine($"[ChatService-{requestId}] Deducting credit for QUESTION (visitor: {request.VisitorId})");
        var creditDeducted = await _visitorService.DeductCreditAsync(request.VisitorId);
        Console.WriteLine($"[ChatService-{requestId}] Credit deduction result: {creditDeducted}");
        if (!creditDeducted)
        {
            var remainingCreditsAfterCheck = await _visitorService.GetRemainingCreditsAsync(request.VisitorId);
            return new ChatResponse
            {
                Message = string.Empty,
                RemainingMessages = remainingCreditsAfterCheck,
                RequiresPayment = true
            };
        }

        // Check if session exists, create if it doesn't
        var existingSessions = await _chatRepository.GetSessionsAsync(request.VisitorId);
        var sessionExists = existingSessions.Any(s => s.SessionId == request.SessionId);
        if (!sessionExists)
        {
            // Create session with title from first message (truncated to 50 chars)
            var title = request.Message.Length > 50 
                ? request.Message.Substring(0, 50) + "..." 
                : request.Message;
            if (string.IsNullOrWhiteSpace(title))
            {
                title = "New Chat";
            }
            await _chatRepository.CreateSessionAsync(request.VisitorId, request.SessionId, title);
            Console.WriteLine($"[ChatService] Created new session: {request.SessionId} for visitor: {request.VisitorId}");
        }

        // Save user message
        var userMessage = new ChatMessage
        {
            SessionId = request.SessionId,
            Timestamp = DateTime.UtcNow,
            Role = "user",
            Content = request.Message
        };
        await _chatRepository.SaveMessageAsync(userMessage);

        // Get conversation history for context
        var conversationHistory = await _chatRepository.GetMessagesAsync(request.SessionId);
        
        // Generate AI response with conversation history
        var aiResponse = await _openAIService.GenerateResponseAsync(
            request.Message, 
            conversationHistory,
            request.SystemPrompt);
        
        // Save AI response (NO deduction for AI response - only deduct for user questions)
        var assistantMessage = new ChatMessage
        {
            SessionId = request.SessionId,
            Timestamp = DateTime.UtcNow,
            Role = "assistant",
            Content = aiResponse
        };
        await _chatRepository.SaveMessageAsync(assistantMessage);

        // Get remaining credits AFTER deduction (only for question)
        var remaining = await _visitorService.GetRemainingCreditsAsync(request.VisitorId);
        Console.WriteLine($"[ChatService-{requestId}] Returning response with remainingMessages: {remaining}");

        return new ChatResponse
        {
            Message = aiResponse,
            RemainingMessages = remaining,
            RequiresPayment = false
        };
    }

    public async Task<List<ChatSession>> GetSessionsAsync(string visitorId)
    {
        return await _chatRepository.GetSessionsAsync(visitorId);
    }

    public async Task<List<ChatMessage>> GetSessionMessagesAsync(string sessionId)
    {
        return await _chatRepository.GetMessagesAsync(sessionId);
    }

    public async IAsyncEnumerable<string> StreamMessageAsync(ChatRequest request, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        Console.WriteLine($"[ChatService] Streaming message for visitor: {request.VisitorId}, session: {request.SessionId}");
        
        // Check if visitor can send message (has credits) - this loads visitor but doesn't modify it
        var canSend = await _visitorService.CanSendMessageAsync(request.VisitorId);
        if (!canSend)
        {
            yield return "{\"type\":\"error\",\"message\":\"No credits remaining\",\"requiresPayment\":true}";
            yield break;
        }

        // Deduct credit for QUESTION (user message) - this method handles loading, deducting, and saving atomically
        Console.WriteLine($"[ChatService] Deducting credit for QUESTION (visitor: {request.VisitorId})");
        var creditDeductedForQuestion = await _visitorService.DeductCreditAsync(request.VisitorId);
        if (!creditDeductedForQuestion)
        {
            yield return "{\"type\":\"error\",\"message\":\"No credits remaining\",\"requiresPayment\":true}";
            yield break;
        }

        // Check if session exists, create if it doesn't
        var existingSessions = await _chatRepository.GetSessionsAsync(request.VisitorId);
        var sessionExists = existingSessions.Any(s => s.SessionId == request.SessionId);
        if (!sessionExists)
        {
            // Create session with title from first message (truncated to 50 chars)
            var title = request.Message.Length > 50 
                ? request.Message.Substring(0, 50) + "..." 
                : request.Message;
            if (string.IsNullOrWhiteSpace(title))
            {
                title = "New Chat";
            }
            await _chatRepository.CreateSessionAsync(request.VisitorId, request.SessionId, title);
            Console.WriteLine($"[ChatService] Created new session: {request.SessionId} for visitor: {request.VisitorId}");
        }

        // Save user message
        var userMessage = new ChatMessage
        {
            SessionId = request.SessionId,
            Timestamp = DateTime.UtcNow,
            Role = "user",
            Content = request.Message
        };
        await _chatRepository.SaveMessageAsync(userMessage);

        // Get conversation history
        var conversationHistory = await _chatRepository.GetMessagesAsync(request.SessionId);
        
        var fullResponse = new StringBuilder();
        
        // Stream AI response
        await foreach (var chunk in _openAIService.StreamResponseAsync(
            request.Message, 
            conversationHistory,
            request.SystemPrompt,
            cancellationToken))
        {
            fullResponse.Append(chunk);
            yield return chunk;
        }

        // Save complete AI response (NO deduction for AI response - only deduct for user questions)
        var assistantMessage = new ChatMessage
        {
            SessionId = request.SessionId,
            Timestamp = DateTime.UtcNow,
            Role = "assistant",
            Content = fullResponse.ToString()
        };
        await _chatRepository.SaveMessageAsync(assistantMessage);

        // Send remaining credits
        var remaining = await _visitorService.GetRemainingCreditsAsync(request.VisitorId);
        yield return $"\n\n{{\"type\":\"metadata\",\"remainingCredits\":{remaining}}}";
    }
}

