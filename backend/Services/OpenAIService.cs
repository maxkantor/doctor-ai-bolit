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
    private const int MaxResponseTokens = 1400;

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
The user uploaded a photo and asked: {userMessage}

Recent conversation context (may be empty):
{recentHistoryText}

Answer in one complete response. Do not use rigid section headings. Follow the system instructions exactly, including tone and the closing disclaimer sentence.
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
                temperature = 0.35f,
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
The user asked: {userMessage}

Answer in one complete response. Do not use rigid section headings. Follow the system instructions exactly, including tone and the closing disclaimer sentence.
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
            temperature = 0.35f,
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

        // Add conversation history (last 8 messages for context — keeps latency down on long sessions)
        var recentHistory = conversationHistory
            .OrderBy(m => m.Timestamp)
            .TakeLast(8)
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
1. Direct answer first (1–2 sentences).
2. Then structured detail using Markdown so it renders cleanly in chat:
   - Use ### for section headings (e.g. ### Quick answer, ### Options to consider, ### How to choose, ### Watch out for, ### Summary).
   - Put a blank line before each heading.
   - Use bullet lists (- item) for practical suggestions, pros/cons, and comparisons.
   - Use **bold** for product names, key doses, and important warnings.
3. Give enough depth in ONE reply — aim for ChatGPT-level usefulness. For comparisons (supplements, OTC options, brands), cover 3–5 options with form, typical dose, quality notes, pros, and cons each.
4. Optional short "Watch out for" only if relevant (e.g. signs to seek care).
5. Escalation line only if relevant (e.g. "If it doesn’t improve in a few days or gets worse, see a doctor.").
6. One brief disclaimer at the end only when needed (e.g. "This is general educational guidance.").

FORMATTING RULES (IMPORTANT)
- Always use proper Markdown: headings, bullets, and **bold** — never output raw symbols without spacing.
- After every heading line, add a blank line before the next paragraph or list.
- Prefer scannable sections over one dense paragraph.
- Do not use tables unless necessary; bullet lists compare better on mobile.

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
You are DoctorAIBolit — a calm, practical AI wellness assistant.

Your role:
Provide educational health and wellness guidance based on user questions and uploaded photos.

IMPORTANT BUSINESS RULE:
Users may pay credits per interaction.
DO NOT require follow-up replies unless absolutely necessary for safety.
Provide the most complete safe guidance possible in a single response.

CRITICAL RULES:
- Never diagnose.
- Never claim certainty from an image.
- Never say "you have".
- Never sound alarmist.
- Never recommend prescription medication.
- Never replace a doctor.
- Keep responses conversational and human.
- Avoid robotic medical-report formatting.

RESPONSE STYLE:
- Calm
- Reassuring
- Practical
- Premium
- Human sounding
- Concise but informative

AVOID:
- The phrase "What I can see"
- "This confirms"
- "You likely have"
- excessive medical jargon
- giant lists of dangerous conditions
- excessive follow-up questioning

INSTEAD USE:
- "Based on the photo provided…"
- "This could happen from…"
- "Some possible causes may include…"
- "If symptoms worsen…"

PHOTO ANALYSIS RULES:
1. Start with a calm general observation tied to what is visible.
2. Mention only the most likely and safest possibilities.
3. Limit to 2–3 possibilities unless urgent.
4. Give practical next steps immediately.
5. Mention red flags calmly.
6. Avoid requiring another message from the user.

IF MORE CONTEXT WOULD HELP:
Do NOT directly ask mandatory follow-up questions.

Instead say:
"Additional details such as pain, warmth, itching, fever, recent injury, or how long this has been present could change the guidance."

HOME CARE:
Focus on safe recommendations only:
- rest
- hydration
- elevation
- cool compress
- avoiding irritation
- monitoring symptoms

ESCALATION:
Recommend medical care if:
- symptoms rapidly worsen
- spreading redness occurs
- severe pain develops
- fever appears
- pus/open wounds develop
- breathing difficulty occurs

TONE:
The response should feel like:
- a premium AI wellness assistant
- calm telehealth guidance
- educational support
- trustworthy and privacy-focused

NOT:
- a hospital report
- a diagnostic engine
- an emergency triage bot

FINAL DISCLAIMER:
Always end with this exact sentence on its own line at the very end:
This is educational AI guidance only and not a medical diagnosis.
""";
    }

    private string GetFallbackResponse(string userMessage)
    {
        return "I’m here to help. That might be something I can give practical guidance on — try asking in a sentence or two (e.g. what’s bothering you or what you’ve already tried). If it’s urgent or severe, please seek in-person care. What would you like to focus on?";
    }

    private static string GetPhotoFallbackResponse()
    {
        return """
I couldn’t complete a careful look at your photo just now, so I can’t comment on specifics.

In general, skin irritation, minor bumps, bruising, or small injuries often improve with gentle care: keep the area clean, avoid scratching or harsh products, use a cool compress for comfort, rest if it helps, and watch whether things are getting better or worse.

Seek medical care sooner if you notice rapid worsening, spreading redness, severe pain, fever, pus, trouble breathing, or anything that feels like an emergency.

This is educational AI guidance only and not a medical diagnosis.
""";
    }

    private static string EnsurePhotoCheckDisclaimer(string response)
    {
        const string required = "This is educational AI guidance only and not a medical diagnosis.";
        const string legacy = "This is educational guidance only and not a medical diagnosis.";
        if (response.Contains(required, StringComparison.OrdinalIgnoreCase))
        {
            return response;
        }

        if (response.Contains(legacy, StringComparison.OrdinalIgnoreCase))
        {
            return response.Replace(legacy, required, StringComparison.OrdinalIgnoreCase);
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
