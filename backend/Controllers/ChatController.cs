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
    private readonly IPhotoStorageService _photoStorageService;
    private static readonly HashSet<string> AllowedPhotoContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };
    private const long MaxPhotoBytes = 5 * 1024 * 1024;

    public ChatController(
        IChatService chatService,
        IVisitorService visitorService,
        IPaymentHistoryRepository paymentHistoryRepository,
        IPhotoStorageService photoStorageService)
    {
        _chatService = chatService;
        _visitorService = visitorService;
        _paymentHistoryRepository = paymentHistoryRepository;
        _photoStorageService = photoStorageService;
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

    [HttpPost("photo-check")]
    [RequestSizeLimit(MaxPhotoBytes + 1024 * 1024)]
    public async Task<ActionResult<ChatResponse>> PhotoCheck([FromForm] PhotoCheckRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.VisitorId) || string.IsNullOrWhiteSpace(request.SessionId) || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest("VisitorId, SessionId, and Message are required");
        }

        if (request.Image == null || request.Image.Length == 0)
        {
            return BadRequest("Image is required");
        }

        if (request.Image.Length > MaxPhotoBytes)
        {
            return BadRequest("Image must be 5MB or smaller");
        }

        if (!AllowedPhotoContentTypes.Contains(request.Image.ContentType))
        {
            return BadRequest("Only JPG, PNG, and WebP images are supported");
        }

        if (!await _visitorService.CanSendMessageAsync(request.VisitorId))
        {
            var remainingCredits = await _visitorService.GetRemainingCreditsAsync(request.VisitorId);
            return Ok(new ChatResponse
            {
                Message = string.Empty,
                RemainingMessages = remainingCredits,
                RequiresPayment = true
            });
        }

        byte[] imageBytes;
        await using (var memoryStream = new MemoryStream())
        {
            await request.Image.CopyToAsync(memoryStream, cancellationToken);
            imageBytes = memoryStream.ToArray();
        }

        if (!IsSupportedImageSignature(imageBytes, request.Image.ContentType))
        {
            return BadRequest("Uploaded file does not match a supported image format");
        }

        try
        {
            var imageMetadata = await _photoStorageService.StoreTemporaryPhotoAsync(
                request.VisitorId,
                request.SessionId,
                request.Image.FileName,
                request.Image.ContentType,
                imageBytes,
                cancellationToken);

            var response = await _chatService.ProcessPhotoCheckAsync(
                new ChatRequest
                {
                    VisitorId = request.VisitorId,
                    SessionId = request.SessionId,
                    Message = request.Message
                },
                imageMetadata,
                imageBytes,
                request.Image.ContentType,
                cancellationToken);

            return Ok(response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ChatController.PhotoCheck] Error processing photo check: {ex.Message}");
            var remainingCredits = await _visitorService.GetRemainingCreditsAsync(request.VisitorId);
            return Ok(new ChatResponse
            {
                Message = "I couldn't complete the photo check right now. Your credit was not used. Please try again in a moment, and seek urgent care now if this could be an emergency.\n\nThis is educational guidance only and not a medical diagnosis.",
                RemainingMessages = remainingCredits,
                RequiresPayment = false
            });
        }
    }

    private static bool IsSupportedImageSignature(byte[] bytes, string contentType)
    {
        if (bytes.Length < 12)
        {
            return false;
        }

        if (contentType.Equals("image/jpeg", StringComparison.OrdinalIgnoreCase))
        {
            return bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF;
        }

        if (contentType.Equals("image/png", StringComparison.OrdinalIgnoreCase))
        {
            return bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47;
        }

        if (contentType.Equals("image/webp", StringComparison.OrdinalIgnoreCase))
        {
            return bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46 &&
                   bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50;
        }

        return false;
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
            var paidMessagesUsed = Math.Max(0, visitor.MessageCount - freeLimit);
            var inferredPurchasedCreditsTotal = Math.Max(0, creditBalance + paidMessagesUsed);
            
            return Ok(new { 
                remainingMessages = remaining,
                creditBalance = creditBalance,
                freeMessagesRemaining = freeMessagesRemaining,
                messageCount = visitor.MessageCount,
                purchasedCreditsTotal = purchasedCreditsTotal,
                totalCreditsAdded = visitor.TotalCreditsAdded,
                inferredPurchasedCreditsTotal = inferredPurchasedCreditsTotal
            });
        }
        
        // Fallback for new visitors
        var defaultFreeLimit = await _visitorService.GetFreeMessageLimitAsync();
        return Ok(new { 
            remainingMessages = remaining,
            creditBalance = 0,
            freeMessagesRemaining = defaultFreeLimit,
            messageCount = 0,
            purchasedCreditsTotal = purchasedCreditsTotal,
            totalCreditsAdded = 0,
            inferredPurchasedCreditsTotal = 0
        });
    }
}

