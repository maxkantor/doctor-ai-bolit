using Amazon.S3;
using Amazon.S3.Model;
using DoctorAIBolit.Models;

namespace DoctorAIBolit.Services;

public class PhotoStorageService : IPhotoStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string? _bucketName;

    public PhotoStorageService(IAmazonS3 s3Client)
    {
        _s3Client = s3Client;
        _bucketName = Environment.GetEnvironmentVariable("S3_BUCKET_PHOTO_CHECK_UPLOADS");
    }

    public async Task<PhotoCheckImageMetadata> StoreTemporaryPhotoAsync(
        string visitorId,
        string sessionId,
        string fileName,
        string contentType,
        byte[] imageBytes,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_bucketName))
        {
            throw new InvalidOperationException("Photo check storage bucket is not configured.");
        }

        var extension = Path.GetExtension(fileName);
        var safeExtension = string.IsNullOrWhiteSpace(extension) ? ".jpg" : extension.ToLowerInvariant();
        var objectKey = $"photo-check/{DateTime.UtcNow:yyyy/MM/dd}/{visitorId}/{sessionId}/{Guid.NewGuid():N}{safeExtension}";

        using var stream = new MemoryStream(imageBytes);
        var putRequest = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = objectKey,
            InputStream = stream,
            ContentType = contentType,
            ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256,
            CannedACL = S3CannedACL.Private,
            Metadata =
            {
                ["visitor-id"] = visitorId,
                ["session-id"] = sessionId,
                ["feature"] = "ai-photo-check"
            }
        };

        await _s3Client.PutObjectAsync(putRequest, cancellationToken);

        return new PhotoCheckImageMetadata
        {
            S3Key = objectKey,
            FileName = fileName,
            ContentType = contentType,
            SizeBytes = imageBytes.LongLength
        };
    }
}
