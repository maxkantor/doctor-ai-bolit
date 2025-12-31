using DoctorAIBolit.Models;
using DoctorAIBolit.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace DoctorAIBolit.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private readonly IVisitorService _visitorService;

    public ChatController(IChatService chatService, IVisitorService visitorService)
    {
        _chatService = chatService;
        _visitorService = visitorService;
    }

    [HttpPost]
    public async Task<ActionResult<ChatResponse>> SendMessage([FromBody] ChatRequest request)
    {
        if (string.IsNullOrEmpty(request.VisitorId) || string.IsNullOrEmpty(request.Message))
        {
            return BadRequest("VisitorId and Message are required");
        }

        var response = await _chatService.ProcessMessageAsync(request);
        return Ok(response);
    }

    [HttpPost("stream")]
    public async Task StreamMessage([FromBody] ChatRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.VisitorId) || string.IsNullOrEmpty(request.Message))
        {
            Response.StatusCode = 400;
            await Response.WriteAsync("VisitorId and Message are required", cancellationToken);
            return;
        }

        Response.ContentType = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["Connection"] = "keep-alive";

        await foreach (var chunk in _chatService.StreamMessageAsync(request, cancellationToken))
        {
            var data = $"data: {chunk}\n\n";
            await Response.WriteAsync(data, cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }
    }

    [HttpGet("sessions")]
    public async Task<ActionResult<List<ChatSession>>> GetSessions([FromQuery] string visitorId)
    {
        if (string.IsNullOrEmpty(visitorId))
        {
            return BadRequest("VisitorId is required");
        }

        var sessions = await _chatService.GetSessionsAsync(visitorId);
        return Ok(sessions);
    }

    [HttpGet("sessions/{sessionId}/messages")]
    public async Task<ActionResult<List<ChatMessage>>> GetMessages(string sessionId)
    {
        var messages = await _chatService.GetSessionMessagesAsync(sessionId);
        return Ok(messages);
    }

    [HttpGet("pricing/config")]
    public async Task<ActionResult> GetPricingConfig()
    {
        var freeLimit = await _visitorService.GetFreeMessageLimitAsync();
        return Ok(new { freeMessageLimit = freeLimit });
    }

    [HttpGet("pricing/plans")]
    public async Task<ActionResult> GetPricingPlans([FromServices] IPricingConfigService pricingService)
    {
        var plans = await pricingService.GetAllPlansAsync();
        return Ok(plans);
    }

    [HttpGet("remaining-messages")]
    public async Task<ActionResult> GetRemainingMessages([FromQuery] string visitorId)
    {
        if (string.IsNullOrEmpty(visitorId))
        {
            return BadRequest("VisitorId is required");
        }

        var remaining = await _visitorService.GetRemainingCreditsAsync(visitorId);
        
        // Also return breakdown for better UI display
        var visitor = await _visitorService.GetOrCreateVisitorAsync(visitorId);
        if (visitor != null)
        {
            var freeLimit = await _visitorService.GetFreeMessageLimitAsync();
            var freeMessagesUsed = Math.Min(visitor.MessageCount, freeLimit);
            var freeMessagesRemaining = Math.Max(0, freeLimit - freeMessagesUsed);
            var creditBalance = visitor.CreditBalance;
            
            return Ok(new { 
                remainingMessages = remaining,
                creditBalance = creditBalance,
                freeMessagesRemaining = freeMessagesRemaining,
                messageCount = visitor.MessageCount
            });
        }
        
        // Fallback for new visitors
        var defaultFreeLimit = await _visitorService.GetFreeMessageLimitAsync();
        return Ok(new { 
            remainingMessages = remaining,
            creditBalance = 0,
            freeMessagesRemaining = defaultFreeLimit,
            messageCount = 0
        });
    }
}

