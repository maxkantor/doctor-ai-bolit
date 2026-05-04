using DoctorAIBolit.Models;
using DoctorAIBolit.Repositories;
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
    private readonly IPaymentHistoryRepository _paymentHistoryRepository;

    public ChatController(IChatService chatService, IVisitorService visitorService, IPaymentHistoryRepository paymentHistoryRepository)
    {
        _chatService = chatService;
        _visitorService = visitorService;
        _paymentHistoryRepository = paymentHistoryRepository;
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
        
        // Auto-seed default plans if none exist (first-time setup)
        if (plans.Count == 0)
        {
            try
            {
                // Create default 20 Messages plan
                var plan20 = new PricingPlan
                {
                    PlanId = Guid.NewGuid().ToString(),
                    Name = "20 Messages",
                    Price = 1.99m,
                    Credits = 20,
                    Description = "Continue your conversation with 20 additional messages whenever you need support.",
                    IsActive = true,
                    IsMostPopular = true,
                    DisplayOrder = 1,
                    CreatedAt = DateTime.UtcNow
                };
                await pricingService.SavePlanAsync(plan20);

                // Create default 50 Messages plan
                var plan50 = new PricingPlan
                {
                    PlanId = Guid.NewGuid().ToString(),
                    Name = "50 Messages",
                    Price = 3.99m,
                    Credits = 50,
                    Description = "Extended support with 50 additional messages for ongoing conversations.",
                    IsActive = true,
                    IsMostPopular = false,
                    DisplayOrder = 2,
                    CreatedAt = DateTime.UtcNow
                };
                await pricingService.SavePlanAsync(plan50);

                // Reload plans after seeding
                plans = await pricingService.GetAllPlansAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ChatController.GetPricingPlans] Error auto-seeding plans: {ex.Message}");
                // Continue and return empty list if seeding fails
            }
        }
        
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
        var payments = await _paymentHistoryRepository.GetPaymentsByVisitorIdAsync(visitorId);
        var purchasedCreditsTotal = payments
            .Where(p => p.Credits > 0 && string.Equals(p.Status, "completed", StringComparison.OrdinalIgnoreCase))
            .Sum(p => p.Credits);
        
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
                messageCount = visitor.MessageCount,
                purchasedCreditsTotal = purchasedCreditsTotal
            });
        }
        
        // Fallback for new visitors
        var defaultFreeLimit = await _visitorService.GetFreeMessageLimitAsync();
        return Ok(new { 
            remainingMessages = remaining,
            creditBalance = 0,
            freeMessagesRemaining = defaultFreeLimit,
            messageCount = 0,
            purchasedCreditsTotal = purchasedCreditsTotal
        });
    }
}

