using Microsoft.AspNetCore.Http;

namespace DoctorAIBolit.Models;

public class PhotoCheckRequest
{
    public string VisitorId { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public IFormFile? Image { get; set; }
}
