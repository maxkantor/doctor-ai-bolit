using DoctorAIBolit.Models;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace DoctorAIBolit.Services;

public class OpenAIService : IOpenAIService
{
    private readonly SecretsService _secretsService;
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly string _model = "gpt-4o-mini"; // Cost-effective model
    private readonly string _visionModel = "gpt-4o"; // Use full vision model for paid photo checks.
    private const int MaxResponseTokens = 1000; // Photo checks need enough room for visible details + targeted next steps.

    // Mental health / crisis detection — direct to crisis resources
    private readonly HashSet<string> _crisisKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        "suicide", "kill myself", "end my life", "want to die", "not worth living",
        "hurt myself", "self harm", "cutting", "overdose", "jump off", "hang myself",
        "no reason to live", "better off dead", "everyone would be better without me"
    };

    // High-risk medical situations — direct to urgent/emergency care
    private readonly HashSet<string> _emergencyKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        "chest pain", "heart attack", "stroke", "can't breathe", "trouble breathing", "severe allergic",
        "anaphylaxis", "passed out", "lost consciousness", "unconscious", "seizure", "convulsion",
        "heavy bleeding", "severe bleeding", "overdose", "poisoning", "suicidal", "want to die",
        "severe alcohol withdrawal", "dt s", "delirium tremens", "dangerous interaction", "drug interaction",
        "pregnancy emergency", "ectopic", "severe abdominal", "sudden severe headache", "can't move",
        "numbness face", "slurred speech", "vision loss", "severe burn", "severe burns", "choking",
        "not breathing", "deep wound", "deep cut", "spreading infection", "red streak", "eye injury",
        "swollen throat", "self-harm", "self harm"
    };

    public OpenAIService(SecretsService secretsService, IHttpClientFactory httpClientFactory)
    {
        _secretsService = secretsService;
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.Timeout = TimeSpan.FromSeconds(60);
        
        // Initialize API key if available
        var secrets = secretsService.GetSecretsAsync().Result;
        _apiKey = secrets.OpenAIApiKey;
        
        if (!string.IsNullOrWhiteSpace(_apiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        }
    }

    public bool DetectCrisis(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
            return false;

        var lowerMessage = message.ToLowerInvariant();
        return _crisisKeywords.Any(keyword => lowerMessage.Contains(keyword));
    }

    public string GetCrisisResponse()
    {
        return @"I'm concerned about what you've shared. Your life has value, and there are people who want to help you.

If you're in immediate danger, please contact emergency services right away:
• Emergency Services: 911 (US) or your local emergency number
• Suicide Prevention Lifeline: 988 (US) — Available 24/7
• Crisis Text Line: Text HOME to 741741

These services are free, confidential, and available 24/7. Please reach out to them. You don't have to go through this alone.

Would you like me to help you find local mental health resources in your area?";
    }

    public string GetEmergencyResponse()
    {
        return @"What you're describing may need urgent medical attention. Please get help right away.

• Call 911 (US) or your local emergency number for emergencies such as chest pain, trouble breathing, stroke symptoms, severe allergic reaction, loss of consciousness, seizures, heavy bleeding, or overdose.
• If you're not sure, go to the nearest emergency department or call a nurse line for guidance.

This is general information only. When in doubt, seek in-person care.";
    }

    public bool DetectEmergency(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
            return false;
        var lower = message.ToLowerInvariant();
        return _emergencyKeywords.Any(k => lower.Contains(k));
    }

    public async Task<string> GenerateResponseAsync(string userMessage, List<ChatMessage> conversationHistory, string? systemPrompt = null, CancellationToken cancellationToken = default)
    {
        if (DetectCrisis(userMessage))
            return GetCrisisResponse();
        if (DetectEmergency(userMessage))
            return GetEmergencyResponse();

        // If OpenAI is not configured, return fallback response
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return GetFallbackResponse(userMessage);
        }

        try
        {
            var messages = BuildMessageList(userMessage, conversationHistory, systemPrompt);
            
            var requestBody = new
            {
                model = _model,
                messages = messages,
                temperature = 0.7f,
                max_tokens = MaxResponseTokens
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content, cancellationToken);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
            var responseObj = JsonSerializer.Deserialize<OpenAIResponse>(responseJson);

            return responseObj?.choices?.FirstOrDefault()?.message?.content?.Trim() ?? GetFallbackResponse(userMessage);
        }
        catch (Exception ex)
        {
            // Log error and return fallback
            Console.WriteLine($"OpenAI API error: {ex.Message}");
            return GetFallbackResponse(userMessage);
        }
    }

    public async Task<string> GeneratePhotoGuidanceAsync(
        string userMessage,
        byte[] imageBytes,
        string imageContentType,
        List<ChatMessage> conversationHistory,
        string? imageUrl = null,
        CancellationToken cancellationToken = default)
    {
        if (DetectCrisis(userMessage))
            return EnsurePhotoCheckDisclaimer(GetCrisisResponse());
        if (DetectEmergency(userMessage))
            return EnsurePhotoCheckDisclaimer(GetEmergencyResponse());

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return GetPhotoFallbackResponse();
        }

        try
        {
            var recentHistoryText = string.Join("\n", conversationHistory
                .OrderBy(m => m.Timestamp)
                .TakeLast(6)
                .Select(m => $"{m.Role}: {m.Content}"));

            var imageDataUrl = $"data:{imageContentType};base64,{Convert.ToBase64String(imageBytes)}";
            var retryImageSource = string.IsNullOrWhiteSpace(imageUrl) ? imageDataUrl : imageUrl;
            Console.WriteLine($"[OpenAIPhoto] Sending vision request. Model={_visionModel}, Source=data-url, HasPresignedRetry={!string.IsNullOrWhiteSpace(imageUrl)}, ContentType={imageContentType}, Bytes={imageBytes.Length}");
            var requestBody = new
            {
                model = _visionModel,
                messages = new object[]
                {
                    new
                    {
                        role = "system",
                        content = GetPhotoCheckSystemPrompt()
                    },
                    new
                    {
                        role = "user",
                        content = new object[]
                        {
                            new
                            {
                                type = "text",
                                text = $"""
You are receiving an uploaded image with this request. Carefully inspect the image and answer the user's question with photo-specific guidance, not a generic template.

Question: {userMessage}

Recent conversation context:
{recentHistoryText}

Before writing, identify the most relevant visible clues: location if inferable, color, shape, borders, swelling, drainage, bruising, number of spots, distribution, and whether the surrounding skin looks affected. Only mention clues you can actually see.

Respond using the required section headings exactly.
"""
                            },
                            new
                            {
                                type = "image_url",
                                image_url = new
                                {
                                    url = imageDataUrl
                                }
                            }
                        }
                    }
                },
                temperature = 0.3f,
                max_tokens = MaxResponseTokens
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content, cancellationToken);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
            var responseObj = JsonSerializer.Deserialize<OpenAIResponse>(responseJson);
            var answer = responseObj?.choices?.FirstOrDefault()?.message?.content?.Trim();
            if (IsImageUnavailableResponse(answer))
            {
                Console.WriteLine("[OpenAIPhoto] First vision response could not view image; retrying with simplified prompt.");
                answer = await GeneratePhotoGuidanceRetryAsync(userMessage, retryImageSource, cancellationToken);
            }
            if (IsImageUnavailableResponse(answer))
            {
                throw new InvalidOperationException("OpenAI vision response did not analyze the uploaded image.");
            }

            return EnsurePhotoCheckDisclaimer(string.IsNullOrWhiteSpace(answer) ? GetPhotoFallbackResponse() : answer);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"OpenAI photo guidance error: {ex.Message}");
            throw;
        }
    }

    private async Task<string> GeneratePhotoGuidanceRetryAsync(string userMessage, string imageSource, CancellationToken cancellationToken)
    {
        var requestBody = new
        {
            model = _visionModel,
            messages = new object[]
            {
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new
                        {
                            type = "text",
                            text = $"""
Look closely at the attached image and answer this user question with image-specific guidance, not generic advice: {userMessage}

Use these headings exactly:
What I can see
Possible explanations, not a diagnosis
What you can do safely at home
Red flags to watch for
When to seek medical care
Emergency warning

In "What I can see", include 2-4 concrete visual observations from the image. In "Possible explanations", explain why each possibility could fit the visible clues and include uncertainty. Never state a definitive diagnosis. Do not recommend prescription medication. Include: "This is educational guidance only and not a medical diagnosis."
"""
                        },
                        new
                        {
                            type = "image_url",
                            image_url = new
                            {
                                url = imageSource
                            }
                        }
                    }
                }
            },
            temperature = 0.2f,
            max_tokens = MaxResponseTokens
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content, cancellationToken);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        var responseObj = JsonSerializer.Deserialize<OpenAIResponse>(responseJson);
        return responseObj?.choices?.FirstOrDefault()?.message?.content?.Trim() ?? string.Empty;
    }

    private static bool IsImageUnavailableResponse(string? response)
    {
        if (string.IsNullOrWhiteSpace(response))
        {
            return true;
        }

        var lower = response.ToLowerInvariant();
        return lower.Contains("cannot view") ||
               lower.Contains("can't view") ||
               lower.Contains("can’t view") ||
               lower.Contains("unable to view") ||
               lower.Contains("cannot analyze") ||
               lower.Contains("can't analyze") ||
               lower.Contains("can’t analyze") ||
               lower.Contains("unable to analyze") ||
               lower.Contains("has not been uploaded") ||
               lower.Contains("image wasn't uploaded") ||
               lower.Contains("image was not uploaded") ||
               lower.Contains("can't assist with that") ||
               lower.Contains("cannot assist with that") ||
               lower.Contains("can’t assist with that") ||
               lower == "i'm sorry, i can't assist with that." ||
               lower == "i’m sorry, i can’t assist with that." ||
               lower == "i am sorry, i cannot assist with that.";
    }

    public async IAsyncEnumerable<string> StreamResponseAsync(string userMessage, List<ChatMessage> conversationHistory, string? systemPrompt = null, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        if (DetectCrisis(userMessage))
        {
            var crisisResponse = GetCrisisResponse();
            foreach (var chunk in SplitIntoChunks(crisisResponse, 10))
            {
                yield return chunk;
                await Task.Delay(50, cancellationToken);
            }
            yield break;
        }
        if (DetectEmergency(userMessage))
        {
            var emergencyResponse = GetEmergencyResponse();
            foreach (var chunk in SplitIntoChunks(emergencyResponse, 10))
            {
                yield return chunk;
                await Task.Delay(50, cancellationToken);
            }
            yield break;
        }

        // If OpenAI is not configured, stream fallback response
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            var fallback = GetFallbackResponse(userMessage);
            foreach (var chunk in SplitIntoChunks(fallback, 10))
            {
                yield return chunk;
                await Task.Delay(50, cancellationToken);
            }
            yield break;
        }

        var messages = BuildMessageList(userMessage, conversationHistory, systemPrompt);

        var requestBody = new
        {
            model = _model,
            messages = messages,
            temperature = 0.7f,
            max_tokens = MaxResponseTokens,
            stream = true
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
        {
            Content = content
        };

        var streamError = false;
        HttpResponseMessage? response = null;
        Stream? stream = null;
        StreamReader? reader = null;

        try
        {
            response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            response.EnsureSuccessStatusCode();

            stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            reader = new StreamReader(stream);
        }
        catch (Exception ex)
        {
            streamError = true;
            Console.WriteLine($"OpenAI streaming error: {ex.Message}");
            reader?.Dispose();
            stream?.Dispose();
            response?.Dispose();
        }

        if (!streamError && reader != null)
        {
            try
            {
                string? line;
                while ((line = await reader.ReadLineAsync()) != null && !cancellationToken.IsCancellationRequested)
                {
                    if (line.StartsWith("data: "))
                    {
                        var data = line.Substring(6).Trim();
                        if (data == "[DONE]")
                            break;

                        string? deltaContent = null;
                        try
                        {
                            var streamResponse = JsonSerializer.Deserialize<OpenAIStreamResponse>(data);
                            deltaContent = streamResponse?.choices?.FirstOrDefault()?.delta?.content;
                        }
                        catch
                        {
                            // Skip invalid JSON lines
                        }
                        
                        if (!string.IsNullOrEmpty(deltaContent))
                        {
                            yield return deltaContent;
                        }
                    }
                }
            }
            finally
            {
                reader?.Dispose();
                stream?.Dispose();
                response?.Dispose();
            }
        }
        else if (streamError)
        {
            reader?.Dispose();
            stream?.Dispose();
            response?.Dispose();
        }

        if (streamError)
        {
            var fallback = GetFallbackResponse(userMessage);
            foreach (var chunk in SplitIntoChunks(fallback, 10))
            {
                yield return chunk;
                await Task.Delay(50, cancellationToken);
            }
        }
    }

    private List<object> BuildMessageList(string userMessage, List<ChatMessage> conversationHistory, string? customSystemPrompt = null)
    {
        var messages = new List<object>();

        // System prompt - use custom if provided, otherwise use default (production health-coach behavior)
        var systemPromptContent = customSystemPrompt ?? GetDefaultSystemPrompt();
        messages.Add(new { role = "system", content = systemPromptContent });

        // Add conversation history (last 10 messages for context)
        var recentHistory = conversationHistory
            .OrderBy(m => m.Timestamp)
            .TakeLast(10)
            .ToList();

        foreach (var msg in recentHistory)
        {
            messages.Add(new { role = msg.Role, content = msg.Content });
        }

        // Add current user message
        messages.Add(new { role = "user", content = userMessage });

        return messages;
    }

    private static string GetDefaultSystemPrompt()
    {
        return """
You are Doctor Aibolit, a warm, practical AI health guide. Your job is to be USEFUL FIRST: give clear, actionable guidance for common wellness and low-risk health questions. You are a smart first-step health guide and a calm triage helper — not a legal disclaimer bot.

CORE BEHAVIOR
- Lead with a direct, helpful answer. Do not start with refusals or "I cannot provide…" for normal questions.
- Give 3–7 practical suggestions when relevant (lifestyle, self-care, over-the-counter options, when to see a doctor only if needed).
- Use a supportive, concise tone. Be empathetic but not overdramatic.
- Do not state conditions with certainty. Do not prescribe prescription medication. Do not recommend dangerous actions.
- Mention seeing a doctor or seeking care only when: symptoms are severe, dangerous, persistent, worsening, or clearly need professional evaluation.
- Avoid repeating the same disclaimer in every answer. If you add a short disclaimer, put it once at the end and keep it brief (e.g. "This is general guidance; if symptoms are severe or worsening, seek medical care.").
- Never sound cold, robotic, or defensive. Avoid: "I must clarify…", "I encourage you to speak with a healthcare professional…", "Consult a healthcare professional…" unless the situation truly warrants it.

TOPICS YOU SHOULD HANDLE HELPFULLY (with practical, educational guidance)
- Sleep (improving sleep, wind-down routines, light/caffeine).
- Stress and anxiety basics (breathing, routine, boundaries).
- Hydration, diet, digestion, bloating, mild stomach issues.
- Exercise recovery, soreness, stretching, rest.
- Minor aches, tension, mild headache.
- Cold and flu self-care (rest, fluids, OTC options).
- Hangover recovery basics (hydration, rest, electrolytes).
- Reducing alcohol consumption (habits, limits, when to get support).
- General supplement education (no prescription advice; when to ask a doctor).
- Healthy routines and general wellness.

RESPONSE SHAPE FOR NORMAL (LOW-RISK) QUESTIONS
1. Direct answer first.
2. 3–7 practical suggestions (bullet or short list when helpful).
3. Optional short "Watch out for" only if relevant (e.g. signs to seek care).
4. Escalation line only if relevant (e.g. "If it doesn’t improve in a few days or gets worse, see a doctor.").
5. One brief disclaimer at the end only when needed (e.g. "This is general educational guidance.").

HIGH-RISK SITUATIONS — ESCALATE IMMEDIATELY
If the user describes any of the following, respond briefly and clearly direct them to urgent/emergency care. Do not give general advice first; lead with "get medical help now" and list how (911, emergency department, etc.):
- Chest pain or possible heart attack.
- Stroke symptoms (sudden weakness, face drooping, speech trouble, severe headache).
- Suicidal intent or self-harm.
- Severe trouble breathing.
- Severe allergic reaction / anaphylaxis.
- Loss of consciousness.
- Seizures.
- Heavy or uncontrolled bleeding.
- Overdose or poisoning.
- Severe alcohol withdrawal (tremors, confusion, hallucinations).
- Dangerous drug interactions.
- Pregnancy emergencies (e.g. severe pain, bleeding).
- Any other clearly life-threatening or severe emergency.

Keep responses focused, readable, and helpful. Prioritize usefulness and clarity over legal phrasing.
""";
    }

    private static string GetPhotoCheckSystemPrompt()
    {
        return """
You are Doctor Aibolit's premium AI Photo Check. Give educational AI photo guidance only.

Quality bar:
- Make the answer feel like it was written after actually looking at this image and reading this exact question.
- Do not give a generic skin/rash/injury checklist. Tie every section to visible details and the user's wording.
- If the user asks "what is it?", say what the visible pattern may be most consistent with, give 2-4 reasonable possibilities, and explain what visual clues support each one.
- If the user asks "how to treat this?", answer with practical care steps for the visible issue first, then explain what changes would make the advice different.
- If important context is missing, ask 1-3 short follow-up questions at the end, but still give useful next steps now.
- Mention limits of the photo only when relevant, for example if scale, pain, warmth, timing, or spreading cannot be judged visually.

Safety and wording rules:
- You are receiving an image input. Review visible details in the image, but do not overstate certainty.
- Never provide a definitive diagnosis from an image.
- Do not name a condition with certainty from the photo.
- Do not recommend prescription medication.
- Use careful language such as "possible explanations", "may be consistent with", "what to watch for", and "next steps".
- If the image or question suggests chest pain, trouble breathing, severe allergic reaction, stroke symptoms, deep wounds, spreading infection, eye injury, severe burns, or suicidal/self-harm content, tell the user to seek urgent or emergency care immediately.
- Always include the exact sentence: "This is educational guidance only and not a medical diagnosis."

Use this exact response format:
What I can see
Possible explanations, not a diagnosis
What you can do safely at home
Red flags to watch for
When to seek medical care
Emergency warning

Section requirements:
- What I can see: 2-4 concrete observations, such as color, swelling, shape, borders, visible breaks in skin, discharge, bruising, or distribution. Do not say only "a patch of skin" unless that is truly all that is visible.
- Possible explanations, not a diagnosis: list the most likely possibilities first. For each, include one image-based reason it could fit and one uncertainty or detail that would change the assessment.
- What you can do safely at home: give specific, low-risk actions. Include what to avoid, such as scratching, squeezing, harsh chemicals, or covering too tightly when relevant.
- Red flags to watch for: tailor these to the visible issue and question.
- When to seek medical care: give concrete timing, for example "today", "within 24-48 hours", or "if it is not improving after a few days", based on severity.
- Emergency warning: keep it short, direct, and include emergency symptoms only.

Tone: direct, premium, human, and practical. Avoid filler phrases and avoid repeating the same idea in multiple sections.
""";
    }

    private string GetFallbackResponse(string userMessage)
    {
        return "I’m here to help. That might be something I can give practical guidance on — try asking in a sentence or two (e.g. what’s bothering you or what you’ve already tried). If it’s urgent or severe, please seek in-person care. What would you like to focus on?";
    }

    private static string GetPhotoFallbackResponse()
    {
        return """
What I can see
I could not complete a full visual review right now.

Possible explanations, not a diagnosis
There are many possible explanations for changes like irritation, bruising, bites, swelling, rashes, or minor injuries, and an in-person clinician can assess details that a photo cannot.

What you can do safely at home
Keep the area clean, avoid picking or scratching, use a cool compress for comfort, and monitor whether it is improving or worsening.

Red flags to watch for
Watch for fast spreading redness, increasing swelling, severe pain, pus, fever, red streaking, numbness, or symptoms that rapidly worsen.

When to seek medical care
Seek medical care if symptoms are worsening, not improving, involve the eye or face, follow a deep injury, or you are concerned.

Emergency warning
For trouble breathing, chest pain, stroke symptoms, severe allergic reaction, deep wounds, severe burns, or self-harm concerns, seek emergency care now.

This is educational guidance only and not a medical diagnosis.
""";
    }

    private static string EnsurePhotoCheckDisclaimer(string response)
    {
        const string required = "This is educational guidance only and not a medical diagnosis.";
        if (response.Contains(required, StringComparison.OrdinalIgnoreCase))
        {
            return response;
        }

        return $"{response.Trim()}\n\n{required}";
    }

    private IEnumerable<string> SplitIntoChunks(string text, int chunkSize)
    {
        for (int i = 0; i < text.Length; i += chunkSize)
        {
            yield return text.Substring(i, Math.Min(chunkSize, text.Length - i));
        }
    }
}

// Response models for OpenAI API
internal class OpenAIResponse
{
    [JsonPropertyName("choices")]
    public List<OpenAIChoice>? choices { get; set; }
}

internal class OpenAIChoice
{
    [JsonPropertyName("message")]
    public OpenAIMessage? message { get; set; }
}

internal class OpenAIMessage
{
    [JsonPropertyName("content")]
    public string? content { get; set; }
}

internal class OpenAIStreamResponse
{
    [JsonPropertyName("choices")]
    public List<StreamChoice>? choices { get; set; }
}

internal class StreamChoice
{
    [JsonPropertyName("delta")]
    public Delta? delta { get; set; }
}

internal class Delta
{
    [JsonPropertyName("content")]
    public string? content { get; set; }
}
