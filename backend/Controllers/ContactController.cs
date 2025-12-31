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

    public ContactController(IContactRepository contactRepository, IEmailService emailService)
    {
        _contactRepository = contactRepository;
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<ActionResult> SubmitContact([FromBody] ContactRequest request)
    {
        if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Message))
        {
            return BadRequest("Name, Email, and Message are required");
        }

        var message = new ContactMessage
        {
            MessageId = Guid.NewGuid().ToString(),
            Name = request.Name,
            Email = request.Email,
            Message = request.Message,
            Status = "new",
            CreatedAt = DateTime.UtcNow
        };

        await _contactRepository.SaveContactMessageAsync(message);
        await _emailService.SendContactNotificationAsync(request.Name, request.Email, request.Message);

        return Ok(new { success = true });
    }
}

public class ContactRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

