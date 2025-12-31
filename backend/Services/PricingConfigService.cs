using DoctorAIBolit.Models;
using DoctorAIBolit.Repositories;

namespace DoctorAIBolit.Services;

public class PricingConfigService : IPricingConfigService
{
    private readonly IPricingConfigRepository _repository;

    public PricingConfigService(IPricingConfigRepository repository)
    {
        _repository = repository;
    }

    public async Task<PricingConfig> GetConfigAsync()
    {
        var config = await _repository.GetConfigAsync();
        return config ?? new PricingConfig();
    }

    public async Task SaveConfigAsync(PricingConfig config)
    {
        await _repository.SaveConfigAsync(config);
    }

    public async Task<List<PricingPlan>> GetAllPlansAsync()
    {
        return await _repository.GetAllPlansAsync();
    }

    public async Task<List<PricingPlan>> GetAllPlansIncludingInactiveAsync()
    {
        return await _repository.GetAllPlansIncludingInactiveAsync();
    }

    public async Task<PricingPlan?> GetPlanAsync(string planId)
    {
        return await _repository.GetPlanAsync(planId);
    }

    public async Task<PricingPlan> SavePlanAsync(PricingPlan plan)
    {
        if (string.IsNullOrEmpty(plan.PlanId))
        {
            plan.PlanId = Guid.NewGuid().ToString();
        }
        await _repository.SavePlanAsync(plan);
        return plan;
    }

    public async Task DeletePlanAsync(string planId)
    {
        await _repository.DeletePlanAsync(planId);
    }
}

