using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public class PricingConfigRepository : IPricingConfigRepository
{
    private readonly IDynamoDBContext _context;

    public PricingConfigRepository(IAmazonDynamoDB dynamoDbClient)
    {
        var config = new DynamoDBContextConfig
        {
            DisableFetchingTableMetadata = true
        };
        _context = new DynamoDBContext(dynamoDbClient, config);
    }

    public async Task<PricingConfig?> GetConfigAsync()
    {
        try
        {
            var config = await _context.LoadAsync<PricingConfig>("default");
            if (config == null)
            {
                // Create default config if it doesn't exist
                config = new PricingConfig
                {
                    ConfigId = "default",
                    FreeMessageLimit = 5,
                    UpdatedAt = DateTime.UtcNow
                };
                await _context.SaveAsync(config);
            }
            return config;
        }
        catch
        {
            // Return default config if error
            return new PricingConfig
            {
                ConfigId = "default",
                FreeMessageLimit = 5
            };
        }
    }

    public async Task SaveConfigAsync(PricingConfig config)
    {
        config.UpdatedAt = DateTime.UtcNow;
        await _context.SaveAsync(config);
    }

    public async Task<List<PricingPlan>> GetAllPlansAsync()
    {
        try
        {
            // Get all plans and filter in memory (pricing plans table will be small)
            var allPlans = await _context.ScanAsync<PricingPlan>(new List<ScanCondition>()).GetRemainingAsync();
            return allPlans
                .Where(p => p.IsActive)
                .OrderBy(p => p.DisplayOrder)
                .ToList();
        }
        catch
        {
            return new List<PricingPlan>();
        }
    }

    public async Task<List<PricingPlan>> GetAllPlansIncludingInactiveAsync()
    {
        try
        {
            // Get ALL plans including inactive ones (for admin/seed operations)
            var allPlans = await _context.ScanAsync<PricingPlan>(new List<ScanCondition>()).GetRemainingAsync();
            return allPlans.OrderBy(p => p.DisplayOrder).ToList();
        }
        catch
        {
            return new List<PricingPlan>();
        }
    }

    public async Task<PricingPlan?> GetPlanAsync(string planId)
    {
        try
        {
            return await _context.LoadAsync<PricingPlan>(planId);
        }
        catch
        {
            return null;
        }
    }

    public async Task SavePlanAsync(PricingPlan plan)
    {
        plan.UpdatedAt = DateTime.UtcNow;
        await _context.SaveAsync(plan);
    }

    public async Task DeletePlanAsync(string planId)
    {
        await _context.DeleteAsync<PricingPlan>(planId);
    }
}

