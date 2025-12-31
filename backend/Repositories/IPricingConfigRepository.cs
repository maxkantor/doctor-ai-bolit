using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public interface IPricingConfigRepository
{
    Task<PricingConfig?> GetConfigAsync();
    Task SaveConfigAsync(PricingConfig config);
    Task<List<PricingPlan>> GetAllPlansAsync();
    Task<List<PricingPlan>> GetAllPlansIncludingInactiveAsync();
    Task<PricingPlan?> GetPlanAsync(string planId);
    Task SavePlanAsync(PricingPlan plan);
    Task DeletePlanAsync(string planId);
}

