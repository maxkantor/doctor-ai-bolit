using DoctorAIBolit.Repositories;

namespace DoctorAIBolit.Services;

public class EmailRestoreService : IEmailRestoreService
{
    private readonly IEmailVisitorMappingRepository _emailMappingRepository;
    private readonly IVisitorRepository _visitorRepository;
    private readonly IEmailService _emailService;
    private readonly IPaymentHistoryRepository _paymentHistoryRepository;

    public EmailRestoreService(
        IEmailVisitorMappingRepository emailMappingRepository,
        IVisitorRepository visitorRepository,
        IEmailService emailService,
        IPaymentHistoryRepository paymentHistoryRepository)
    {
        _emailMappingRepository = emailMappingRepository;
        _visitorRepository = visitorRepository;
        _emailService = emailService;
        _paymentHistoryRepository = paymentHistoryRepository;
    }

    public async Task<string> SendVerificationCodeAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email is required");
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();

        // First, check if email has any linked visitors
        var mappings = await _emailMappingRepository.GetVisitorIdsByEmailAsync(normalizedEmail);
        
        // If no mappings found, check PaymentHistory for existing payments with this email
        // This handles payments made before email linking was implemented
        if (mappings.Count == 0)
        {
            Console.WriteLine($"[EmailRestoreService] No email mappings found for {normalizedEmail}, checking PaymentHistory...");
            
            try
            {
                var paymentsWithEmail = await _paymentHistoryRepository.GetPaymentsByEmailAsync(normalizedEmail);
                
                if (paymentsWithEmail.Count > 0)
                {
                    Console.WriteLine($"[EmailRestoreService] Found {paymentsWithEmail.Count} payment(s) with email {normalizedEmail}, linking them now...");
                    
                    // Link email to all visitor IDs from payments
                    var uniqueVisitorIds = paymentsWithEmail
                        .Select(p => p.VisitorId)
                        .Distinct()
                        .ToList();
                    
                    Console.WriteLine($"[EmailRestoreService] Found {uniqueVisitorIds.Count} unique visitor ID(s) to link: {string.Join(", ", uniqueVisitorIds)}");
                    
                    foreach (var visitorId in uniqueVisitorIds)
                    {
                        try
                        {
                            await _emailMappingRepository.LinkEmailToVisitorAsync(normalizedEmail, visitorId);
                            Console.WriteLine($"[EmailRestoreService] ✅ Linked email {normalizedEmail} to visitor {visitorId} from payment history");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[EmailRestoreService] Error linking email to visitor {visitorId}: {ex.Message}");
                            Console.WriteLine($"[EmailRestoreService] Stack trace: {ex.StackTrace}");
                        }
                    }
                    
                    // Re-fetch mappings after linking
                    mappings = await _emailMappingRepository.GetVisitorIdsByEmailAsync(normalizedEmail);
                    Console.WriteLine($"[EmailRestoreService] After linking, found {mappings.Count} email mapping(s)");
                }
                else
                {
                    Console.WriteLine($"[EmailRestoreService] No payments found in PaymentHistory for email: {normalizedEmail}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailRestoreService] Error checking PaymentHistory: {ex.Message}");
                Console.WriteLine($"[EmailRestoreService] Stack trace: {ex.StackTrace}");
                throw;
            }
        }
        
        if (mappings.Count == 0)
        {
            throw new Exception("No account found with this email address. Please make sure you've made a purchase with this email.");
        }

        // Generate and save verification code
        var code = await _emailMappingRepository.GenerateVerificationCodeAsync(normalizedEmail);

        // Send verification code via email
        try
        {
            await _emailService.SendVerificationCodeAsync(normalizedEmail, code);
            Console.WriteLine($"[EmailRestoreService] Verification code sent to: {normalizedEmail}");
        }
        catch (Amazon.SimpleEmail.Model.MessageRejectedException ex)
        {
            Console.WriteLine($"[EmailRestoreService] Email rejected by SES: {ex.Message}");
            throw new Exception($"Email could not be sent. Please verify your email address is correct and try again. Error: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailRestoreService] Error sending verification code: {ex.Message}");
            Console.WriteLine($"[EmailRestoreService] Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[EmailRestoreService] Inner exception: {ex.InnerException.Message}");
            }
            throw new Exception($"Failed to send verification code: {ex.Message}. Please try again later.");
        }

        return code;
    }

    public async Task<EmailRestoreResult> VerifyAndRestoreCreditsAsync(string email, string verificationCode, string currentVisitorId)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(verificationCode))
        {
            return new EmailRestoreResult
            {
                Success = false,
                Message = "Email and verification code are required"
            };
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();

        // Verify the code
        var isValid = await _emailMappingRepository.VerifyEmailAsync(normalizedEmail, verificationCode);
        if (!isValid)
        {
            return new EmailRestoreResult
            {
                Success = false,
                Message = "Invalid or expired verification code. Please request a new code."
            };
        }

        // Get all visitor IDs linked to this email
        var mappings = await _emailMappingRepository.GetVisitorIdsByEmailAsync(normalizedEmail);
        if (mappings.Count == 0)
        {
            return new EmailRestoreResult
            {
                Success = false,
                Message = "No accounts found for this email"
            };
        }

        // Get all visitors and merge their credits
        var allVisitors = new List<Models.Visitor>();
        int totalCreditsToMerge = 0;

        foreach (var mapping in mappings)
        {
            // Skip the current visitor - don't transfer credits from the same device
            if (mapping.VisitorId == currentVisitorId)
            {
                Console.WriteLine($"[EmailRestoreService] Skipping current visitor {currentVisitorId}");
                continue;
            }

            var visitor = await _visitorRepository.GetVisitorAsync(mapping.VisitorId);
            if (visitor != null && visitor.CreditBalance > 0)
            {
                allVisitors.Add(visitor);
                totalCreditsToMerge += visitor.CreditBalance;
                Console.WriteLine($"[EmailRestoreService] Found visitor {mapping.VisitorId} with {visitor.CreditBalance} credits to transfer");
            }
        }

        if (allVisitors.Count == 0)
        {
            return new EmailRestoreResult
            {
                Success = false,
                Message = "No credits found to restore from other devices"
            };
        }

        // Get or create current visitor
        var currentVisitor = await _visitorRepository.GetVisitorAsync(currentVisitorId);
        if (currentVisitor == null)
        {
            currentVisitor = await _visitorRepository.CreateVisitorAsync(currentVisitorId);
        }

        // Transfer credits: add all credits from other visitors to current visitor
        var creditsBeforeMerge = currentVisitor.CreditBalance;
        currentVisitor.CreditBalance += totalCreditsToMerge;
        await _visitorRepository.UpdateVisitorAsync(currentVisitor);

        // Zero out credits on source visitors (transfer, don't duplicate)
        foreach (var sourceVisitor in allVisitors)
        {
            var creditsTransferred = sourceVisitor.CreditBalance;
            sourceVisitor.CreditBalance = 0;
            await _visitorRepository.UpdateVisitorAsync(sourceVisitor);
            Console.WriteLine($"[EmailRestoreService] Transferred {creditsTransferred} credits from {sourceVisitor.VisitorId} to {currentVisitorId}");
        }

        // Link current visitor to email
        await _emailMappingRepository.LinkEmailToVisitorAsync(normalizedEmail, currentVisitorId);

        Console.WriteLine($"[EmailRestoreService] ✅ Transferred {totalCreditsToMerge} credits from {allVisitors.Count} visitor(s) into {currentVisitorId}. Balance before: {creditsBeforeMerge}, Balance after: {currentVisitor.CreditBalance}");

        return new EmailRestoreResult
        {
            Success = true,
            Message = $"Successfully restored {totalCreditsToMerge} credits from {allVisitors.Count} account(s).",
            TotalCreditsRestored = totalCreditsToMerge,
            MergedVisitorId = currentVisitorId
        };
    }
}

