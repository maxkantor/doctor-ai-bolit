using DoctorAIBolit.Models;

namespace DoctorAIBolit.Services;

public interface IPhotoStorageService
{
    Task<PhotoCheckImageMetadata> StoreTemporaryPhotoAsync(string visitorId, string sessionId, string fileName, string contentType, byte[] imageBytes, CancellationToken cancellationToken = default);
}
