using DoctorAIBolit.Models;
using DoctorAIBolit.Services;
using Microsoft.AspNetCore.Mvc;

namespace DoctorAIBolit.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IEmailService _emailService;
    private readonly IPricingConfigService _pricingConfigService;
    private readonly DoctorAIBolit.Repositories.IContactRepository _contactRepository;

    public AdminController(
        IAdminService adminService,
        IEmailService emailService,
        IPricingConfigService pricingConfigService,
        DoctorAIBolit.Repositories.IContactRepository contactRepository)
    {
        _adminService = adminService;
        _emailService = emailService;
        _pricingConfigService = pricingConfigService;
        _contactRepository = contactRepository;
    }

    private bool IsAuthorized()
    {
        if (!Request.Headers.TryGetValue("X-ADMIN-KEY", out var headerValue))
        {
            return false;
        }

        var adminKey = headerValue.ToString();
        if (string.IsNullOrWhiteSpace(adminKey))
        {
            return false;
        }

        return _adminService.ValidateAdminKeyAsync(adminKey).Result;
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<Visitor>>> GetUsers()
    {
        if (!IsAuthorized()) return Unauthorized();

        try
        {
            Console.WriteLine("[AdminController.GetUsers] Fetching all visitors");
            var users = await _adminService.GetAllVisitorsAsync();
            Console.WriteLine($"[AdminController.GetUsers] Returning {users.Count} visitors");
            return Ok(users);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AdminController.GetUsers] Error: {ex.Message}");
            Console.WriteLine($"[AdminController.GetUsers] Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { error = "Failed to retrieve users", message = ex.Message });
        }
    }

    [HttpGet("user/{visitorId}")]
    public async Task<ActionResult<Visitor>> GetUser(string visitorId)
    {
        if (!IsAuthorized()) return Unauthorized();

        var user = await _adminService.GetVisitorByIdAsync(visitorId);
        if (user == null) return NotFound();
        
        return Ok(user);
    }

    [HttpPost("credits")]
    public async Task<ActionResult> AddCredits([FromBody] AddCreditsRequest request)
    {
        if (!IsAuthorized()) return Unauthorized();

        await _adminService.AddCreditsAsync(request.VisitorId, request.Credits);
        return Ok(new { success = true });
    }

    [HttpPost("reset")]
    public async Task<ActionResult> ResetVisitor([FromBody] ResetVisitorRequest request)
    {
        if (!IsAuthorized()) return Unauthorized();

        await _adminService.ResetVisitorAsync(request.VisitorId);
        return Ok(new { success = true });
    }

    [HttpPost("reset-messages")]
    public async Task<ActionResult> ResetMessageCount([FromBody] ResetMessageCountRequest request)
    {
        if (!IsAuthorized()) return Unauthorized();

        await _adminService.ResetMessageCountAsync(request.VisitorId, request.ResetTo);
        return Ok(new { success = true });
    }

    [HttpGet("emails")]
    public async Task<ActionResult<List<ContactMessage>>> GetEmails()
    {
        if (!IsAuthorized()) return Unauthorized();

        var emails = await _contactRepository.GetAllContactMessagesAsync();
        return Ok(emails);
    }

    [HttpPost("email/reply")]
    public async Task<ActionResult> ReplyToEmail([FromBody] EmailReplyRequest request)
    {
        if (!IsAuthorized()) return Unauthorized();

        try
        {
            Console.WriteLine($"[AdminController] ReplyToEmail called - To: {request.To}, Subject: {request.Subject}");
            
            if (string.IsNullOrWhiteSpace(request.To))
            {
                return BadRequest(new { success = false, message = "Recipient email address is required" });
            }
            
            if (string.IsNullOrWhiteSpace(request.Subject))
            {
                return BadRequest(new { success = false, message = "Email subject is required" });
            }
            
            if (string.IsNullOrWhiteSpace(request.Body))
            {
                return BadRequest(new { success = false, message = "Email body is required" });
            }

            await _emailService.SendEmailReplyAsync(request.To, request.Subject, request.Body);
            Console.WriteLine($"[AdminController] Email reply sent successfully");
            return Ok(new { success = true, message = "Email sent successfully" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AdminController] Error replying to email: {ex.Message}");
            Console.WriteLine($"[AdminController] Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("payments")]
    public async Task<ActionResult<List<PaymentHistory>>> GetPaymentHistory([FromQuery] string? visitorId = null)
    {
        if (!IsAuthorized()) return Unauthorized();

        try
        {
            var payments = await _adminService.GetPaymentHistoryAsync(visitorId);
            return Ok(payments);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AdminController.GetPaymentHistory] Error: {ex.Message}");
            return StatusCode(500, new { error = "Failed to retrieve payment history", message = ex.Message });
        }
    }

    [HttpGet("pricing/config")]
    public async Task<ActionResult<PricingConfig>> GetPricingConfig()
    {
        if (!IsAuthorized()) return Unauthorized();

        var config = await _pricingConfigService.GetConfigAsync();
        return Ok(config);
    }

    [HttpPost("pricing/config")]
    public async Task<ActionResult> SavePricingConfig([FromBody] PricingConfig config)
    {
        if (!IsAuthorized()) return Unauthorized();

        await _pricingConfigService.SaveConfigAsync(config);
        return Ok(new { success = true });
    }

    [HttpGet("pricing/plans")]
    public async Task<ActionResult<List<PricingPlan>>> GetPricingPlans()
    {
        if (!IsAuthorized()) return Unauthorized();

        var plans = await _pricingConfigService.GetAllPlansAsync();
        return Ok(plans);
    }

    [HttpGet("pricing/plans/{planId}")]
    public async Task<ActionResult<PricingPlan>> GetPricingPlan(string planId)
    {
        if (!IsAuthorized()) return Unauthorized();

        var plan = await _pricingConfigService.GetPlanAsync(planId);
        if (plan == null) return NotFound();
        return Ok(plan);
    }

    [HttpPost("pricing/plans")]
    public async Task<ActionResult<PricingPlan>> CreatePricingPlan([FromBody] PricingPlan plan)
    {
        if (!IsAuthorized()) return Unauthorized();

        var savedPlan = await _pricingConfigService.SavePlanAsync(plan);
        return Ok(savedPlan);
    }

    [HttpPut("pricing/plans/{planId}")]
    public async Task<ActionResult<PricingPlan>> UpdatePricingPlan(string planId, [FromBody] PricingPlan plan)
    {
        if (!IsAuthorized()) return Unauthorized();

        plan.PlanId = planId;
        var savedPlan = await _pricingConfigService.SavePlanAsync(plan);
        return Ok(savedPlan);
    }

    [HttpDelete("pricing/plans/{planId}")]
    public async Task<ActionResult> DeletePricingPlan(string planId)
    {
        if (!IsAuthorized()) return Unauthorized();

        await _pricingConfigService.DeletePlanAsync(planId);
        return Ok(new { success = true });
    }
}

public class AddCreditsRequest
{
    public string VisitorId { get; set; } = string.Empty;
    public int Credits { get; set; }
}

public class ResetVisitorRequest
{
    public string VisitorId { get; set; } = string.Empty;
}

public class ResetMessageCountRequest
{
    public string VisitorId { get; set; } = string.Empty;
    public int? ResetTo { get; set; }
}

public class EmailReplyRequest
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

