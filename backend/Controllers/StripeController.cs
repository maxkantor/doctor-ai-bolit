using DoctorAIBolit.Services;
using Microsoft.AspNetCore.Mvc;

namespace DoctorAIBolit.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StripeController : ControllerBase
{
    private readonly IStripeService _stripeService;

    public StripeController(IStripeService stripeService)
    {
        _stripeService = stripeService;
    }

    [HttpPost("checkout")]
    public async Task<ActionResult<CheckoutResponse>> CreateCheckout([FromBody] CheckoutRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.VisitorId) || string.IsNullOrEmpty(request.PriceId))
            {
                return BadRequest(new { success = false, message = "VisitorId and PriceId are required" });
            }

            Console.WriteLine($"[StripeController] Creating checkout - VisitorId: {request.VisitorId}, PriceId: {request.PriceId}, Credits: {request.Credits}");
            
            var checkoutUrl = await _stripeService.CreateCheckoutSessionAsync(
                request.VisitorId, 
                request.PriceId, 
                request.Credits);
            
            return Ok(new CheckoutResponse { Url = checkoutUrl });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[StripeController] Error creating checkout: {ex.Message}");
            Console.WriteLine($"[StripeController] Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPost("webhook")]
    public async Task<ActionResult> Webhook()
    {
        try
        {
            var json = await new StreamReader(Request.Body).ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"].ToString();

            Console.WriteLine($"[StripeController] Received webhook - Signature present: {!string.IsNullOrEmpty(signature)}");

            var success = await _stripeService.HandleWebhookAsync(json, signature);
            
            if (success)
            {
                Console.WriteLine($"[StripeController] Webhook processed successfully");
                return Ok();
            }
            
            Console.WriteLine($"[StripeController] Webhook processing failed");
            return BadRequest(new { success = false, message = "Webhook processing failed" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[StripeController] Error processing webhook: {ex.Message}");
            Console.WriteLine($"[StripeController] Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}

public class CheckoutRequest
{
    public string VisitorId { get; set; } = string.Empty;
    public string PriceId { get; set; } = string.Empty;
    public int? Credits { get; set; } // Number of credits for credit pack purchases
}

public class CheckoutResponse
{
    public string Url { get; set; } = string.Empty;
}

