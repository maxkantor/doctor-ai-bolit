namespace DoctorAIBolit.Services;

public interface IOgImageService
{
    Task<string> GetOgImageUrlAsync(string sessionId);
    Task<string> GetDefaultOgImageUrlAsync();
}

