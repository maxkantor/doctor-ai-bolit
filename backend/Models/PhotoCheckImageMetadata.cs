namespace DoctorAIBolit.Models;

public class PhotoCheckImageMetadata
{
    public string S3Key { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
}
