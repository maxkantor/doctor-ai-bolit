using Amazon.S3;
using Amazon.S3.Model;

namespace DoctorAIBolit.Services;

public class OgImageService : IOgImageService
{
    private readonly IAmazonS3 _s3;
    private const string BucketName = "doctoraibolit-og-images";
    private const string BaseUrl = "https://doctoraibolit-og-images.s3.amazonaws.com";

    public OgImageService(IAmazonS3 s3)
    {
        _s3 = s3;
    }

    public async Task<string> GetOgImageUrlAsync(string sessionId)
    {
        var key = $"og/session-{sessionId}.png";
        
        // Check if image exists
        try
        {
            await _s3.GetObjectMetadataAsync(BucketName, key);
            return $"{BaseUrl}/{key}";
        }
        catch
        {
            // Return default if session image doesn't exist
            return await GetDefaultOgImageUrlAsync();
        }
    }

    public Task<string> GetDefaultOgImageUrlAsync()
    {
        return Task.FromResult($"{BaseUrl}/og/default.png");
    }
}

