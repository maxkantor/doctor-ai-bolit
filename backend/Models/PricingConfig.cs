using Amazon.DynamoDBv2.DataModel;

namespace DoctorAIBolit.Models;

[DynamoDBTable("DoctorAibolitPricingConfig")]
public class PricingConfig
{
    [DynamoDBHashKey]
    public string ConfigId { get; set; } = "default";
    
    public int FreeMessageLimit { get; set; } = 5; // Initial free messages for new users
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[DynamoDBTable("DoctorAibolitPricingPlans")]
public class PricingPlan
{
    [DynamoDBHashKey]
    public string PlanId { get; set; } = string.Empty;
    
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Credits { get; set; } // Number of messages included
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public bool IsMostPopular { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    public string? StripePriceId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

