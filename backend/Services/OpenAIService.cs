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
    
    // Crisis detection keywords
    private readonly HashSet<string> _crisisKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        "suicide", "kill myself", "end my life", "want to die", "not worth living",
        "hurt myself", "self harm", "cutting", "overdose", "jump off", "hang myself",
        "no reason to live", "better off dead", "everyone would be better without me"
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
• Suicide Prevention Lifeline: 988 (US) - Available 24/7
• Crisis Text Line: Text HOME to 741741

These services are free, confidential, and available 24/7. Please reach out to them. You don't have to go through this alone.

Would you like me to help you find local mental health resources in your area?";
    }

    public async Task<string> GenerateResponseAsync(string userMessage, List<ChatMessage> conversationHistory, string? systemPrompt = null, CancellationToken cancellationToken = default)
    {
        // Check for crisis first
        if (DetectCrisis(userMessage))
        {
            return GetCrisisResponse();
        }

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
                max_tokens = 300
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

    public async IAsyncEnumerable<string> StreamResponseAsync(string userMessage, List<ChatMessage> conversationHistory, string? systemPrompt = null, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        // Check for crisis first
        if (DetectCrisis(userMessage))
        {
            var crisisResponse = GetCrisisResponse();
            foreach (var chunk in SplitIntoChunks(crisisResponse, 10))
            {
                yield return chunk;
                await Task.Delay(50, cancellationToken); // Simulate streaming
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

        var messages = BuildMessageList(userMessage, conversationHistory);
        
        var requestBody = new
        {
            model = _model,
            messages = messages,
            temperature = 0.7f,
            max_tokens = 300,
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

        // System prompt - use custom if provided, otherwise use default
        var systemPromptContent = customSystemPrompt ?? @"You are **Doctor Aibolit**, a friendly and professional AI health assistant.
You provide general health information, symptom explanations, and wellness guidance.
You do not diagnose medical conditions or prescribe treatments.
You clearly state you are not a replacement for a licensed physician.
When appropriate, you encourage users to seek professional medical care.
You communicate clearly, calmly, and empathetically.";
        
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

    private string GetFallbackResponse(string userMessage)
    {
        var response = new StringBuilder();
        response.AppendLine("I hear you, and I want you to know that what you're feeling is valid.");
        response.AppendLine();
        response.AppendLine("It sounds like you're going through a challenging moment. When health concerns arise, it can feel overwhelming.");
        response.AppendLine();
        response.AppendLine("Here's something that might help: Try taking three deep breaths. Inhale slowly for four counts, hold for four, and exhale for four. This simple technique can help calm your nervous system.");
        response.AppendLine();
        response.AppendLine("What health questions or concerns can I help you with today?");
        
        return response.ToString();
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
