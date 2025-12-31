using DoctorAIBolit.Models;

namespace DoctorAIBolit.Services;

public interface IPricingConfigService
{
    Task<PricingConfig> GetConfigAsync();
    Task SaveConfigAsync(PricingConfig config);
    Task<List<PricingPlan>> GetAllPlansAsync();
    Task<List<PricingPlan>> GetAllPlansIncludingInactiveAsync();
    Task<PricingPlan?> GetPlanAsync(string planId);
    Task<PricingPlan> SavePlanAsync(PricingPlan plan);
    Task DeletePlanAsync(string planId);
}

