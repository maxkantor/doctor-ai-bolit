using Amazon.DynamoDBv2.DataModel;

namespace DoctorAIBolit.Models;

[DynamoDBTable("DoctorAibolitPaymentHistory")]
public class PaymentHistory
{
    [DynamoDBHashKey]
    public string PaymentId { get; set; } = string.Empty; // Stripe session ID or payment intent ID
    
    [DynamoDBRangeKey]
    public string VisitorId { get; set; } = string.Empty;
    
    public string StripeSessionId { get; set; } = string.Empty;
    public string StripeCustomerId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "usd";
    public int Credits { get; set; }
    public string PlanId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // "completed", "pending", "failed"
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public string? CustomerEmail { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? BillingAddressLine1 { get; set; }
    public string? BillingAddressLine2 { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingState { get; set; }
    public string? BillingPostalCode { get; set; }
    public string? BillingCountry { get; set; }
    public string? PaymentMethodType { get; set; } // "card", "paypal", etc.
    public string? PaymentMethodBrand { get; set; } // "visa", "mastercard", etc.
    public string? PaymentMethodLast4 { get; set; } // Last 4 digits of card
    public Dictionary<string, string>? Metadata { get; set; }
}

