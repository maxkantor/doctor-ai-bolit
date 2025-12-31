using DoctorAIBolit.Models;
using DoctorAIBolit.Services;
using Microsoft.AspNetCore.Mvc;

namespace DoctorAIBolit.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly IPricingConfigService _pricingConfigService;
    private readonly IAdminService _adminService;

    public SeedController(
        IPricingConfigService pricingConfigService,
        IAdminService adminService)
    {
        _pricingConfigService = pricingConfigService;
        _adminService = adminService;
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

    [HttpPost("default-pricing")]
    public async Task<ActionResult> SeedDefaultPricing()
    {
        if (!IsAuthorized()) return Unauthorized();

        try
        {
            // Always ensure default config exists with correct values
            var config = await _pricingConfigService.GetConfigAsync();
            config.ConfigId = "default";
            config.FreeMessageLimit = 5;
            await _pricingConfigService.SaveConfigAsync(config);

            // Get ALL existing plans including inactive ones (to find and update old plans)
            var existingPlans = await _pricingConfigService.GetAllPlansIncludingInactiveAsync();
            
            // Find or create 20 Messages plan ($1.99)
            // Look for plans with 20 credits, $1.99 price, or old "24-Hour" name
            var plan20 = existingPlans.FirstOrDefault(p => 
                p.Credits == 20 || 
                (p.Price == 1.99m && p.Credits > 0) ||
                p.Name.Contains("24-Hour") || 
                p.Name.Contains("24 Hour"));
            
            if (plan20 == null)
            {
                plan20 = new PricingPlan
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
            }
            else
            {
                // Update existing plan to ensure it's correct
                plan20.Name = "20 Messages";
                plan20.Price = 1.99m;
                plan20.Credits = 20;
                plan20.Description = "Continue your conversation with 20 additional messages whenever you need support.";
                plan20.IsMostPopular = true;
                plan20.DisplayOrder = 1;
                plan20.IsActive = true;
            }
            await _pricingConfigService.SavePlanAsync(plan20);

            // Find or create 50 Messages plan ($3.99)
            // Look for plans with 50 credits, $3.99 price, or old "7-Day" name
            var plan50 = existingPlans.FirstOrDefault(p => 
                p.Credits == 50 || 
                (p.Price == 3.99m && p.Credits > 0) ||
                p.Name.Contains("7-Day") || 
                p.Name.Contains("7 Day"));
            
            if (plan50 == null)
            {
                plan50 = new PricingPlan
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
            }
            else
            {
                // Update existing plan
                plan50.Name = "50 Messages";
                plan50.Price = 3.99m;
                plan50.Credits = 50;
                plan50.Description = "Extended support with 50 additional messages for ongoing conversations.";
                plan50.DisplayOrder = 2;
                plan50.IsActive = true;
            }
            await _pricingConfigService.SavePlanAsync(plan50);

            return Ok(new { success = true, message = "Default pricing configuration seeded successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}

