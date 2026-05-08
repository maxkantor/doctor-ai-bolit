using DoctorAIBolit.Models;
using DoctorAIBolit.Repositories;
using DoctorAIBolit.Services;
using Microsoft.AspNetCore.Mvc;

namespace DoctorAIBolit.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IContactRepository _contactRepository;
    private readonly IEmailService _emailService;
    private readonly IVisitorService _visitorService;

    public ContactController(IContactRepository contactRepository, IEmailService emailService, IVisitorService visitorService)
    {
        _contactRepository = contactRepository;
        _emailService = emailService;
        _visitorService = visitorService;
    }

    [HttpPost]
    public async Task<ActionResult> SubmitContact([FromBody] ContactRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Message))
        {
            return BadRequest("Name, Email, and Message are required");
        }

        var visitorId = Request.Headers.TryGetValue("X-Visitor-Id", out var headerVisitor)
            ? headerVisitor.ToString().Trim()
            : null;
        if (string.IsNullOrWhiteSpace(visitorId) && !string.IsNullOrWhiteSpace(request.VisitorId))
        {
            visitorId = request.VisitorId.Trim();
        }

        if (!string.IsNullOrWhiteSpace(visitorId))
        {
            await _visitorService.RecordVisitorActivityAsync(visitorId, cancellationToken);
        }

        var message = new ContactMessage
        {
            MessageId = Guid.NewGuid().ToString(),
            Name = request.Name,
            Email = request.Email,
            Message = request.Message,
            Status = "new",
            CreatedAt = DateTime.UtcNow,
            VisitorId = string.IsNullOrWhiteSpace(visitorId) ? null : visitorId,
            EmailSent = null
        };

        await _contactRepository.SaveContactMessageAsync(message);

        var emailSent = false;
        try
        {
            await _emailService.SendContactNotificationAsync(request.Name, request.Email, request.Message);
            emailSent = true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ContactController] SES notify failed for MessageId={message.MessageId}: {ex.Message}");
        }

        message.EmailSent = emailSent;
        await _contactRepository.SaveContactMessageAsync(message);

        return Ok(new { success = true, emailSent });
    }

    public class ContactRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        /// <summary>Optional; also read from X-Visitor-Id on the request.</summary>
        public string? VisitorId { get; set; }
    }
}
