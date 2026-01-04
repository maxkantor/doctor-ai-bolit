using Stripe;
using Stripe.Checkout;
using DoctorAIBolit.Repositories;
using DoctorAIBolit.Services;
using DoctorAIBolit.Models;
using Microsoft.Extensions.Configuration;

namespace DoctorAIBolit.Services;

public class StripeService : IStripeService
{
    private readonly SecretsService _secretsService;
    private readonly IVisitorRepository _visitorRepository;
    private readonly IPricingConfigService _pricingConfigService;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly IPaymentHistoryRepository _paymentHistoryRepository;
    private readonly IEmailVisitorMappingRepository _emailVisitorMappingRepository;

    public StripeService(
        SecretsService secretsService,
        IVisitorRepository visitorRepository,
        IPricingConfigService pricingConfigService,
        IConfiguration configuration,
        IEmailService emailService,
        IPaymentHistoryRepository paymentHistoryRepository,
        IEmailVisitorMappingRepository emailVisitorMappingRepository)
    {
        _secretsService = secretsService;
        _visitorRepository = visitorRepository;
        _pricingConfigService = pricingConfigService;
        _configuration = configuration;
        _emailService = emailService;
        _paymentHistoryRepository = paymentHistoryRepository;
        _emailVisitorMappingRepository = emailVisitorMappingRepository;
    }

    public async Task<string> CreateCheckoutSessionAsync(string visitorId, string priceId, int? credits = null)
    {
        string actualPriceId = priceId; // Declare outside try block for error messages
        try
        {
            var secrets = await _secretsService.GetSecretsAsync();
            if (string.IsNullOrWhiteSpace(secrets.Stripe.SecretKey))
            {
                throw new Exception("Stripe secret key is not configured. Please add STRIPE_SECRET_KEY to AWS Secrets Manager.");
            }
            
            StripeConfiguration.ApiKey = secrets.Stripe.SecretKey;

        // Look up plan to get price and credits
        decimal planPrice = 0m;
        int? planCredits = credits;
        string planName = "Credit Pack";
        string planDescription = "";
        
        var plan = await _pricingConfigService.GetPlanAsync(priceId);
        
        // If plan not found by ID, try to find by credits or create default plan
        if (plan == null)
        {
            Console.WriteLine($"[StripeService] Plan not found by ID: {priceId}, attempting to find by credits: {credits}");
            
            // Try to find plan by credits
            var allPlans = await _pricingConfigService.GetAllPlansAsync();
            if (credits.HasValue)
            {
                plan = allPlans.FirstOrDefault(p => p.Credits == credits.Value);
            }
            
            // If still not found and we have credits, create a default plan on the fly
            if (plan == null && credits.HasValue)
            {
                Console.WriteLine($"[StripeService] Creating plan on-the-fly for {credits} credits");
                
                // Determine price and details based on credits
                if (credits.Value == 20)
                {
                    planPrice = 1.99m;
                    planName = "20 Messages";
                    planDescription = "Continue your conversation with 20 additional messages whenever you need support.";
                }
                else if (credits.Value == 50)
                {
                    planPrice = 3.99m;
                    planName = "50 Messages";
                    planDescription = "Extended support with 50 additional messages for ongoing conversations.";
                }
                else
                {
                    // Generic plan
                    planPrice = (credits.Value * 0.1m); // $0.10 per message default
                    planName = $"{credits.Value} Messages";
                    planDescription = $"Continue your conversation with {credits.Value} additional messages.";
                }
                
                planCredits = credits.Value;
                
                // Create and save the plan
                plan = new PricingPlan
                {
                    PlanId = Guid.NewGuid().ToString(),
                    Name = planName,
                    Price = planPrice,
                    Credits = planCredits.Value,
                    Description = planDescription,
                    IsActive = true,
                    IsMostPopular = credits.Value == 20,
                    DisplayOrder = credits.Value == 20 ? 1 : 2,
                    CreatedAt = DateTime.UtcNow
                };
                
                await _pricingConfigService.SavePlanAsync(plan);
                Console.WriteLine($"[StripeService] Created new plan: {plan.PlanId} - {planName} for ${planPrice}");
            }
            else if (plan == null)
            {
                throw new Exception($"Plan not found: {priceId} and no credits provided. Please ensure the plan exists in the database or provide credits.");
            }
        }
        
        // Use plan data
        if (plan != null)
        {
            planPrice = plan.Price;
            planName = plan.Name;
            planDescription = plan.Description;
            if (!planCredits.HasValue)
            {
                planCredits = plan.Credits;
            }
        }
        
        // Final fallback: if we still don't have a plan but have credits, use defaults
        if (planPrice <= 0 && credits.HasValue)
        {
            Console.WriteLine($"[StripeService] Using fallback pricing for {credits.Value} credits");
            if (credits.Value == 20)
            {
                planPrice = 1.99m;
                planName = "20 Messages";
                planDescription = "Continue your conversation with 20 additional messages whenever you need support.";
            }
            else if (credits.Value == 50)
            {
                planPrice = 3.99m;
                planName = "50 Messages";
                planDescription = "Extended support with 50 additional messages for ongoing conversations.";
            }
            else
            {
                planPrice = (credits.Value * 0.1m);
                planName = $"{credits.Value} Messages";
                planDescription = $"Continue your conversation with {credits.Value} additional messages.";
            }
            planCredits = credits.Value;
        }
        
        // Validate we have required information
        if (planPrice <= 0)
        {
            throw new Exception($"Invalid price for plan {planName}: ${planPrice}. Price must be greater than 0. Credits provided: {credits}, PlanId: {priceId}");
        }
        
        if (!planCredits.HasValue || planCredits.Value <= 0)
        {
            throw new Exception($"Invalid credits for plan {planName}: {planCredits}. Credits must be greater than 0. Credits provided: {credits}, PlanId: {priceId}");
        }

        // All plans are now credit packs (one-time payments)
        var mode = "payment";

        // Build metadata - ensure credits are always included
        var finalCredits = planCredits ?? credits ?? 0;
        var metadata = new Dictionary<string, string>
        {
            { "visitorId", visitorId },
            { "planId", plan?.PlanId ?? priceId },
            { "type", "credit_pack" },
            { "credits", finalCredits.ToString() }
        };
        
        // Final validation before Stripe call
        if (planPrice <= 0)
        {
            throw new Exception($"Cannot create checkout: Invalid price ${planPrice} for {planName}. Credits: {planCredits}, PlanId: {priceId}");
        }
        
        if (!planCredits.HasValue || planCredits.Value <= 0)
        {
            throw new Exception($"Cannot create checkout: Invalid credits {planCredits} for {planName}. PlanId: {priceId}");
        }
        
        var baseUrl = GetBaseUrl();
        Console.WriteLine($"[StripeService] Creating Stripe checkout - Plan: {planName}, Price: ${planPrice}, Credits: {planCredits.Value}, BaseUrl: {baseUrl}");
        
        // Create checkout session using price_data instead of price_id
        // This allows us to use dynamic pricing without pre-creating Stripe products
        var successUrl = $"{baseUrl}/chat?session_id={{CHECKOUT_SESSION_ID}}";
        var cancelUrl = $"{baseUrl}/chat";
        
        Console.WriteLine($"[StripeService] SuccessUrl: {successUrl}");
        Console.WriteLine($"[StripeService] CancelUrl: {cancelUrl}");
        
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "usd",
                        UnitAmount = (long)(planPrice * 100), // Convert to cents
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = planName,
                            Description = string.IsNullOrWhiteSpace(planDescription) ? planName : planDescription
                        }
                    },
                    Quantity = 1,
                },
            },
            Mode = mode,
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            Metadata = metadata,
            // Add customer email collection for better experience
            CustomerCreation = "always"
        };
        
            try
            {
                var service = new SessionService();
                Console.WriteLine($"[StripeService] Calling Stripe API to create checkout session...");
                var session = await service.CreateAsync(options);
                Console.WriteLine($"[StripeService] ✅ Stripe checkout session created successfully: {session.Id}");
                return session.Url ?? throw new Exception("Stripe returned null checkout URL");
            }
            catch (StripeException stripeEx)
            {
                Console.WriteLine($"[StripeService] ❌ Stripe API error: {stripeEx.Message}");
                Console.WriteLine($"[StripeService] Stripe error type: {stripeEx.StripeError?.Type}, Code: {stripeEx.StripeError?.Code}");
                throw; // Re-throw to be caught by outer catch block
            }
        }
        catch (StripeException ex)
        {
            Console.WriteLine($"[StripeService] Stripe error creating checkout: {ex.Message}");
            Console.WriteLine($"[StripeService] Stripe error type: {ex.StripeError?.Type}, Code: {ex.StripeError?.Code}");
            
            // Provide more helpful error messages for common issues
            string errorMessage = ex.Message;
            var stripeError = ex.StripeError;
            
            if (stripeError != null)
            {
                if (stripeError.Code == "api_key_expired" || stripeError.Type == "invalid_request_error")
                {
                    errorMessage = "Stripe API key is invalid or expired. Please check your Stripe configuration in AWS Secrets Manager.";
                }
                else if (stripeError.Message != null)
                {
                    errorMessage = stripeError.Message;
                }
            }
            
            if (ex.Message.Contains("test mode") && ex.Message.Contains("live mode"))
            {
                errorMessage = "Stripe mode mismatch: The Price ID is from live mode, but you're using a test mode API key (or vice versa). Please ensure your Stripe API key matches the mode of your Price IDs.";
            }
            else if (ex.Message.Contains("No such price"))
            {
                errorMessage = $"Stripe Price ID not found: {actualPriceId}. Please verify the Price ID is correct in your Stripe dashboard and matches the mode (test/live) of your API key.";
            }
            
            throw new Exception($"Stripe error: {errorMessage}", ex);
        }
        catch
        {
            throw;
        }
    }

    public async Task<bool> HandleWebhookAsync(string json, string signature)
    {
        try
        {
            var secrets = await _secretsService.GetSecretsAsync();
            var webhookSecret = secrets.Stripe.WebhookSecret;
            
            if (string.IsNullOrWhiteSpace(webhookSecret))
            {
                Console.WriteLine($"[StripeService] ERROR: Webhook secret is not configured");
                return false;
            }
            
            // Set Stripe API key for session retrieval
            if (!string.IsNullOrWhiteSpace(secrets.Stripe.SecretKey))
            {
                StripeConfiguration.ApiKey = secrets.Stripe.SecretKey;
            }
            
            // Use throwOnApiVersionMismatch: false to handle version mismatches gracefully
            // This allows processing webhooks even if Stripe sends events with newer API versions
            var stripeEvent = EventUtility.ConstructEvent(json, signature, webhookSecret, 
                throwOnApiVersionMismatch: false);
            
            Console.WriteLine($"[StripeService] Webhook event type: {stripeEvent.Type}, Id: {stripeEvent.Id}");

            // Handle checkout.session.completed (primary) and charge.succeeded (fallback)
            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Session;
                
                // Retrieve full session details from Stripe to ensure we have all metadata
                if (session != null && !string.IsNullOrWhiteSpace(secrets.Stripe.SecretKey))
                {
                    try
                    {
                        var sessionService = new SessionService();
                        var fullSession = await sessionService.GetAsync(session.Id);
                        session = fullSession;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[StripeService] Warning: Could not retrieve full session from Stripe: {ex.Message}");
                        // Continue with the session object from the event
                    }
                }
                
                if (session?.Metadata?.ContainsKey("visitorId") == true)
                {
                    var visitorId = session.Metadata["visitorId"];
                    Console.WriteLine($"[StripeService] Processing checkout.session.completed for visitor: {visitorId}");
                    Console.WriteLine($"[StripeService] Session metadata: {string.Join(", ", session.Metadata?.Select(kvp => $"{kvp.Key}={kvp.Value}") ?? new List<string>())}");
                    
                    // Use GetOrCreateVisitorAsync to ensure visitor exists (creates if missing)
                    var visitor = await _visitorRepository.GetVisitorAsync(visitorId);
                    if (visitor == null)
                    {
                        Console.WriteLine($"[StripeService] ⚠️ WARNING: Visitor {visitorId} not found. Creating new visitor record.");
                        visitor = await _visitorRepository.CreateVisitorAsync(visitorId);
                    }
                    else
                    {
                        Console.WriteLine($"[StripeService] ✅ Found existing visitor: {visitorId}, Current Credits: {visitor.CreditBalance}, CreatedAt: {visitor.CreatedAt}");
                    }
                    var purchaseType = session.Metadata.GetValueOrDefault("type", "credit_pack");
                    Console.WriteLine($"[StripeService] Purchase type: {purchaseType}, SessionId: {session.Id}, Amount: {session.AmountTotal}");
                    
                    // Get payment details
                    var amount = session.AmountTotal.HasValue ? (decimal)session.AmountTotal.Value / 100 : 0m; // Convert from cents
                    var currency = session.Currency ?? "usd";
                    var customerEmail = session.CustomerEmail ?? session.CustomerDetails?.Email;
                    var customerName = session.CustomerDetails?.Name;
                    var customerPhone = session.CustomerDetails?.Phone;
                    
                    // Extract billing address
                    var billingAddress = session.CustomerDetails?.Address;
                    var billingAddressLine1 = billingAddress?.Line1;
                    var billingAddressLine2 = billingAddress?.Line2;
                    var billingCity = billingAddress?.City;
                    var billingState = billingAddress?.State;
                    var billingPostalCode = billingAddress?.PostalCode;
                    var billingCountry = billingAddress?.Country;
                    
                    // Extract payment method details
                    string? paymentMethodType = null;
                    string? paymentMethodBrand = null;
                    string? paymentMethodLast4 = null;
                    
                    // Try to get payment method from session
                    if (!string.IsNullOrEmpty(session.PaymentIntentId))
                    {
                        try
                        {
                            var paymentIntentService = new PaymentIntentService();
                            var paymentIntent = await paymentIntentService.GetAsync(session.PaymentIntentId);
                            
                            if (paymentIntent?.PaymentMethodId != null)
                            {
                                var paymentMethodService = new PaymentMethodService();
                                var paymentMethod = await paymentMethodService.GetAsync(paymentIntent.PaymentMethodId);
                                
                                paymentMethodType = paymentMethod?.Type;
                                
                                if (paymentMethod?.Card != null)
                                {
                                    paymentMethodBrand = paymentMethod.Card.Brand;
                                    paymentMethodLast4 = paymentMethod.Card.Last4;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[StripeService] Could not retrieve payment method details: {ex.Message}");
                        }
                    }
                    
                    var planId = session.Metadata.GetValueOrDefault("planId", "");
                    var planName = "Credit Pack";
                    var credits = 0;
                    
                    // Get plan details if available
                    if (!string.IsNullOrEmpty(planId))
                    {
                        var plan = await _pricingConfigService.GetPlanAsync(planId);
                        if (plan != null)
                        {
                            planName = plan.Name;
                            credits = plan.Credits;
                        }
                    }
                    
                    // Get credits from metadata if plan lookup didn't work
                    if (credits == 0 && session.Metadata.ContainsKey("credits"))
                    {
                        if (int.TryParse(session.Metadata["credits"], out var metadataCredits))
                        {
                            credits = metadataCredits;
                        }
                    }
                    
                    // If still no credits, log warning but try to proceed
                    if (credits == 0)
                    {
                        Console.WriteLine($"[StripeService] WARNING: No credits found for purchase. PlanId: {planId}, Metadata: {string.Join(", ", session.Metadata?.Select(kvp => $"{kvp.Key}={kvp.Value}") ?? new List<string>())}");
                    }
                    
                    if (purchaseType == "credit_pack" && credits > 0)
                    {
                        // Check if payment has already been processed (idempotency check)
                        // Do this FIRST before any processing to prevent race conditions
                        var existingPayment = await _paymentHistoryRepository.GetPaymentByIdAsync(session.Id, visitorId);
                        if (existingPayment != null)
                        {
                            Console.WriteLine($"[StripeService] Payment {session.Id} already processed for visitor {visitorId}. Skipping duplicate processing and emails.");
                            return true; // Already processed, return success - don't send duplicate emails
                        }
                        
                        // Save payment history FIRST to prevent race conditions with charge.succeeded
                        var payment = new PaymentHistory
                        {
                            PaymentId = session.Id,
                            VisitorId = visitorId,
                            StripeSessionId = session.Id,
                            StripeCustomerId = session.CustomerId ?? "",
                            Amount = amount,
                            Currency = currency,
                            Credits = credits,
                            PlanId = planId,
                            PlanName = planName,
                            Status = "completed",
                            PaymentDate = DateTime.UtcNow,
                            CustomerEmail = customerEmail,
                            CustomerName = customerName,
                            CustomerPhone = customerPhone,
                            BillingAddressLine1 = billingAddressLine1,
                            BillingAddressLine2 = billingAddressLine2,
                            BillingCity = billingCity,
                            BillingState = billingState,
                            BillingPostalCode = billingPostalCode,
                            BillingCountry = billingCountry,
                            PaymentMethodType = paymentMethodType,
                            PaymentMethodBrand = paymentMethodBrand,
                            PaymentMethodLast4 = paymentMethodLast4,
                            Metadata = session.Metadata?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value) ?? new Dictionary<string, string>()
                        };
                        
                        try
                        {
                            await _paymentHistoryRepository.SavePaymentAsync(payment);
                            Console.WriteLine($"[StripeService] Payment history saved: {session.Id}");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[StripeService] Error saving payment history: {ex.Message}");
                            // Don't fail the webhook if payment history save fails
                        }
                        
                        // Link email to visitor if email is available (for cross-device credit restoration)
                        if (!string.IsNullOrWhiteSpace(customerEmail))
                        {
                            try
                            {
                                await _emailVisitorMappingRepository.LinkEmailToVisitorAsync(customerEmail, visitorId);
                                Console.WriteLine($"[StripeService] ✅ Linked email {customerEmail} to visitor {visitorId}");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"[StripeService] Error linking email to visitor: {ex.Message}");
                                // Don't fail the webhook if email linking fails
                            }
                        }
                        
                        // Add credits to user's balance
                        var oldBalance = visitor.CreditBalance;
                        visitor.CreditBalance += credits;
                        await _visitorRepository.UpdateVisitorAsync(visitor);
                        Console.WriteLine($"[StripeService] ✅ Added {credits} credits to visitor {visitorId}. Old balance: {oldBalance}, New balance: {visitor.CreditBalance}");
                        
                        // Send email notifications
                        if (!string.IsNullOrWhiteSpace(customerEmail))
                        {
                            try
                            {
                                await _emailService.SendPaymentConfirmationAsync(customerEmail, session.CustomerDetails?.Name ?? "", amount, credits, planName);
                                Console.WriteLine($"[StripeService] ✅ Payment confirmation email sent to customer");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"[StripeService] Error sending payment confirmation email: {ex.Message}");
                                // Don't fail the webhook if email fails
                            }
                        }
                        
                        // Send admin notification (always send, even if customer email is missing)
                        try
                        {
                            await _emailService.SendPaymentNotificationToAdminAsync(visitorId, customerEmail ?? "No email provided", amount, credits, planName, session.Id);
                            Console.WriteLine($"[StripeService] ✅ Admin notification email sent");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[StripeService] ❌ Error sending admin notification: {ex.Message}");
                            // Don't fail the webhook if admin email fails
                        }
                    }
                    else if (purchaseType == "plan_purchase")
                    {
                        // Time-based plan purchase - grant premium access for duration
                        visitor.IsPremium = true;
                        await _visitorRepository.UpdateVisitorAsync(visitor);
                        // Note: In production, you'd want to track expiration date
                    }
                    else
                    {
                        // Premium subscription
                        visitor.IsPremium = true;
                        await _visitorRepository.UpdateVisitorAsync(visitor);
                    }
                }
                else
                {
                    Console.WriteLine($"[StripeService] WARNING: Checkout session missing visitorId in metadata");
                }
            }
            else if (stripeEvent.Type == "charge.succeeded")
            {
                // Skip charge.succeeded entirely - we only process checkout.session.completed
                // This prevents duplicate emails and processing
                // Stripe sends both events, but checkout.session.completed is the authoritative one
                Console.WriteLine($"[StripeService] Ignoring charge.succeeded event - only processing checkout.session.completed to prevent duplicates");
                return true; // Return success but don't process
            }
            
            // OLD CODE - DISABLED - charge.succeeded handler removed to prevent duplicate emails
            // This code is never executed - kept for reference only
            if (false)
            {
                // This code is disabled - we only process checkout.session.completed
                var charge = stripeEvent.Data.Object as Charge;
                
                // Try to get checkout session from payment intent
                if (charge?.PaymentIntentId != null)
                {
                    try
                    {
                        var paymentIntentService = new PaymentIntentService();
                        var paymentIntent = await paymentIntentService.GetAsync(charge.PaymentIntentId);
                        
                        // Look up checkout session by payment intent
                        var sessionService = new SessionService();
                        var sessionListOptions = new SessionListOptions
                        {
                            PaymentIntent = paymentIntent.Id,
                            Limit = 1
                        };
                        var sessions = await sessionService.ListAsync(sessionListOptions);
                        
                        if (sessions.Data.Count > 0)
                        {
                            var session = sessions.Data[0];
                            var fullSession = await sessionService.GetAsync(session.Id);
                            
                            // Process the session the same way as checkout.session.completed
                            if (fullSession?.Metadata?.ContainsKey("visitorId") == true)
                            {
                                var visitorId = fullSession.Metadata["visitorId"];
                                
                                // Use GetOrCreateVisitorAsync to ensure visitor exists (creates if missing)
                                var visitor = await _visitorRepository.GetOrCreateVisitorAsync(visitorId);
                                var purchaseType = fullSession.Metadata.GetValueOrDefault("type", "credit_pack");
                                var planId = fullSession.Metadata.GetValueOrDefault("planId", "");
                                var planName = "Credit Pack";
                                var credits = 0;
                                
                                // Get plan details
                                if (!string.IsNullOrEmpty(planId))
                                {
                                    var plan = await _pricingConfigService.GetPlanAsync(planId);
                                    if (plan != null)
                                    {
                                        planName = plan.Name;
                                        credits = plan.Credits;
                                    }
                                }
                                
                                // Get credits from metadata if plan lookup didn't work
                                if (credits == 0 && fullSession.Metadata.ContainsKey("credits"))
                                {
                                    if (int.TryParse(fullSession.Metadata["credits"], out var metadataCredits))
                                    {
                                        credits = metadataCredits;
                                    }
                                }
                                
                                if (purchaseType == "credit_pack" && credits > 0)
                                {
                                    // Check if payment has already been processed (idempotency check)
                                    var existingPayment = await _paymentHistoryRepository.GetPaymentByIdAsync(fullSession.Id, visitorId);
                                    if (existingPayment != null)
                                    {
                                        Console.WriteLine($"[StripeService] Payment {fullSession.Id} already processed via checkout.session.completed. Skipping duplicate processing and emails.");
                                        return true; // Already processed, return success - don't send duplicate emails
                                    }
                                    
                                    var amount = fullSession.AmountTotal.HasValue ? (decimal)fullSession.AmountTotal.Value / 100 : 0m;
                                    var customerEmail = fullSession.CustomerEmail ?? fullSession.CustomerDetails?.Email;
                                    var customerName = fullSession.CustomerDetails?.Name;
                                    var customerPhone = fullSession.CustomerDetails?.Phone;
                                    
                                    // Extract billing address
                                    var billingAddress = fullSession.CustomerDetails?.Address;
                                    var billingAddressLine1 = billingAddress?.Line1;
                                    var billingAddressLine2 = billingAddress?.Line2;
                                    var billingCity = billingAddress?.City;
                                    var billingState = billingAddress?.State;
                                    var billingPostalCode = billingAddress?.PostalCode;
                                    var billingCountry = billingAddress?.Country;
                                    
                                    // Extract payment method details
                                    string? paymentMethodType = null;
                                    string? paymentMethodBrand = null;
                                    string? paymentMethodLast4 = null;
                                    
                                    if (!string.IsNullOrEmpty(fullSession.PaymentIntentId))
                                    {
                                        try
                                        {
                                            var pmtIntentService = new PaymentIntentService();
                                            var pmtIntent = await pmtIntentService.GetAsync(fullSession.PaymentIntentId);
                                            
                                            if (pmtIntent?.PaymentMethodId != null)
                                            {
                                                var pmtMethodService = new PaymentMethodService();
                                                var pmtMethod = await pmtMethodService.GetAsync(pmtIntent.PaymentMethodId);
                                                
                                                paymentMethodType = pmtMethod?.Type;
                                                
                                                if (pmtMethod?.Card != null)
                                                {
                                                    paymentMethodBrand = pmtMethod.Card.Brand;
                                                    paymentMethodLast4 = pmtMethod.Card.Last4;
                                                }
                                            }
                                        }
                                        catch (Exception ex)
                                        {
                                            Console.WriteLine($"[StripeService] Could not retrieve payment method details: {ex.Message}");
                                        }
                                    }
                                    
                                    // Add credits
                                    var oldBalance = visitor.CreditBalance;
                                    visitor.CreditBalance += credits;
                                    await _visitorRepository.UpdateVisitorAsync(visitor);
                                    Console.WriteLine($"[StripeService] ✅ Added {credits} credits to visitor {visitorId}. Old balance: {oldBalance}, New balance: {visitor.CreditBalance}");
                                    
                                    // Record payment history
                                    var payment = new PaymentHistory
                                    {
                                        PaymentId = fullSession.Id,
                                        VisitorId = visitorId,
                                        StripeSessionId = fullSession.Id,
                                        StripeCustomerId = fullSession.CustomerId ?? "",
                                        Amount = amount,
                                        Currency = fullSession.Currency ?? "usd",
                                        Credits = credits,
                                        PlanId = planId,
                                        PlanName = planName,
                                        Status = "completed",
                                        PaymentDate = DateTime.UtcNow,
                                        CustomerEmail = customerEmail,
                                        CustomerName = customerName,
                                        CustomerPhone = customerPhone,
                                        BillingAddressLine1 = billingAddressLine1,
                                        BillingAddressLine2 = billingAddressLine2,
                                        BillingCity = billingCity,
                                        BillingState = billingState,
                                        BillingPostalCode = billingPostalCode,
                                        BillingCountry = billingCountry,
                                        PaymentMethodType = paymentMethodType,
                                        PaymentMethodBrand = paymentMethodBrand,
                                        PaymentMethodLast4 = paymentMethodLast4,
                                        Metadata = fullSession.Metadata?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value) ?? new Dictionary<string, string>()
                                    };
                                    
                                    try
                                    {
                                        await _paymentHistoryRepository.SavePaymentAsync(payment);
                                    }
                                    catch (Exception ex)
                                    {
                                        Console.WriteLine($"[StripeService] Error saving payment history: {ex.Message}");
                                    }
                                    
                                    // Send email notifications
                                    if (!string.IsNullOrWhiteSpace(customerEmail))
                                    {
                                        try
                                        {
                                            await _emailService.SendPaymentConfirmationAsync(customerEmail, fullSession.CustomerDetails?.Name ?? "", amount, credits, planName);
                                        }
                                        catch (Exception ex)
                                        {
                                            Console.WriteLine($"[StripeService] Error sending payment confirmation email: {ex.Message}");
                                        }
                                    }
                                    
                                    // Send admin notification
                                    try
                                    {
                                        Console.WriteLine($"[StripeService] Sending admin notification email for payment: SessionId={fullSession.Id}, VisitorId={visitorId}, Amount=${amount}, Credits={credits}");
                                        await _emailService.SendPaymentNotificationToAdminAsync(visitorId, customerEmail ?? "No email provided", amount, credits, planName, fullSession.Id);
                                        Console.WriteLine($"[StripeService] ✅ Admin notification email sent successfully");
                                    }
                                    catch (Exception ex)
                                    {
                                        Console.WriteLine($"[StripeService] ❌ Error sending admin notification: {ex.Message}");
                                        Console.WriteLine($"[StripeService] Stack trace: {ex.StackTrace}");
                                    }
                                }
                            }
                            else
                            {
                                Console.WriteLine($"[StripeService] WARNING: Checkout session from charge missing visitorId in metadata");
                            }
                        }
                        else
                        {
                            Console.WriteLine($"[StripeService] WARNING: Could not find checkout session for payment intent: {paymentIntent.Id}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[StripeService] Error processing charge.succeeded: {ex.Message}");
                    }
                }
                else
                {
                    Console.WriteLine($"[StripeService] WARNING: charge.succeeded event has no PaymentIntentId");
                }
            }
            else
            {
                Console.WriteLine($"[StripeService] Ignoring webhook event type: {stripeEvent.Type} (Id: {stripeEvent.Id})");
            }

            return true;
        }
        catch (StripeException ex)
        {
            Console.WriteLine($"[StripeService] Stripe error handling webhook: {ex.Message}");
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[StripeService] Error handling webhook: {ex.Message}");
            return false;
        }
    }

    private string GetBaseUrl()
    {
        // Priority order:
        // 1. BASE_URL (preferred - use this)
        // 2. FRONTEND_URL (legacy/fallback - kept for backward compatibility)
        // 3. Default fallback URL
        
        var configBaseUrl = _configuration["BASE_URL"];
        var envBaseUrl = Environment.GetEnvironmentVariable("BASE_URL");
        var configFrontendUrl = _configuration["FRONTEND_URL"];
        var envFrontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
        
        var baseUrl = configBaseUrl 
            ?? envBaseUrl
            ?? configFrontendUrl  // Legacy fallback
            ?? envFrontendUrl;    // Legacy fallback
        
        if (!string.IsNullOrWhiteSpace(baseUrl))
        {
            return baseUrl.TrimEnd('/');
        }
        
        // Fallback URL - Production domain
        return "https://doctoraibolit.com";
    }
}

