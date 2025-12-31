using DoctorAIBolit.Services;
using DoctorAIBolit.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace DoctorAIBolit.Controllers;

[ApiController]
[Route("api/email-restore")]
public class EmailRestoreController : ControllerBase
{
    private readonly IEmailRestoreService _emailRestoreService;
    private readonly IPaymentHistoryRepository _paymentHistoryRepository;

    public EmailRestoreController(
        IEmailRestoreService emailRestoreService,
        IPaymentHistoryRepository paymentHistoryRepository)
    {
        _emailRestoreService = emailRestoreService;
        _paymentHistoryRepository = paymentHistoryRepository;
    }

    [HttpPost("send-code")]
    public async Task<ActionResult> SendVerificationCode([FromBody] SendCodeRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { success = false, message = "Email is required" });
            }

            Console.WriteLine($"[EmailRestoreController] SendVerificationCode called for email: {request.Email}");
            
            // Debug: Check if email exists in payment history
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var paymentsWithEmail = await _paymentHistoryRepository.GetPaymentsByEmailAsync(normalizedEmail);
            Console.WriteLine($"[EmailRestoreController] Found {paymentsWithEmail.Count} payment(s) with email {normalizedEmail}");
            
            if (paymentsWithEmail.Count > 0)
            {
                foreach (var payment in paymentsWithEmail)
                {
                    Console.WriteLine($"[EmailRestoreController] Payment found - PaymentId: {payment.PaymentId}, VisitorId: {payment.VisitorId}, Amount: {payment.Amount}, Email: {payment.CustomerEmail}");
                }
            }
            else
            {
                // Check all payments to see what emails exist
                var allPayments = await _paymentHistoryRepository.GetAllPaymentsAsync();
                var uniqueEmails = allPayments
                    .Where(p => !string.IsNullOrWhiteSpace(p.CustomerEmail))
                    .Select(p => p.CustomerEmail!.Trim().ToLowerInvariant())
                    .Distinct()
                    .ToList();
                Console.WriteLine($"[EmailRestoreController] Total payments in DB: {allPayments.Count}");
                Console.WriteLine($"[EmailRestoreController] Unique emails in DB: {uniqueEmails.Count}");
                Console.WriteLine($"[EmailRestoreController] Emails in DB: {string.Join(", ", uniqueEmails)}");
            }
            
            await _emailRestoreService.SendVerificationCodeAsync(request.Email);
            
            Console.WriteLine($"[EmailRestoreController] Verification code sent successfully");
            return Ok(new { success = true, message = "Verification code sent to your email" });
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"[EmailRestoreController] Validation error: {ex.Message}");
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailRestoreController] Error sending verification code: {ex.Message}");
            Console.WriteLine($"[EmailRestoreController] Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[EmailRestoreController] Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPost("verify-and-restore")]
    public async Task<ActionResult<EmailRestoreResult>> VerifyAndRestore([FromBody] VerifyAndRestoreRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.VerificationCode) || string.IsNullOrWhiteSpace(request.VisitorId))
            {
                return BadRequest(new { success = false, message = "Email, verification code, and visitor ID are required" });
            }

            var result = await _emailRestoreService.VerifyAndRestoreCreditsAsync(
                request.Email, 
                request.VerificationCode, 
                request.VisitorId);

            if (result.Success)
            {
                return Ok(result);
            }
            else
            {
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailRestoreController] Error verifying and restoring: {ex.Message}");
            return StatusCode(500, new EmailRestoreResult 
            { 
                Success = false, 
                Message = ex.Message 
            });
        }
    }
}

public class SendCodeRequest
{
    public string Email { get; set; } = string.Empty;
}

public class VerifyAndRestoreRequest
{
    public string Email { get; set; } = string.Empty;
    public string VerificationCode { get; set; } = string.Empty;
    public string VisitorId { get; set; } = string.Empty;
}

