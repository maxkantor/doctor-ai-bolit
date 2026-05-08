namespace DoctorAIBolit.Models;

public class PhotoCheckClientEventRequest
{
    public string VisitorId { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public long? FileSizeBytes { get; set; }
    public string? Detail { get; set; }
}
