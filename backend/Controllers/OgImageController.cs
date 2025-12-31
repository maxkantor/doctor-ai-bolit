using DoctorAIBolit.Services;
using Microsoft.AspNetCore.Mvc;

namespace DoctorAIBolit.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OgImageController : ControllerBase
{
    private readonly IOgImageService _ogImageService;

    public OgImageController(IOgImageService ogImageService)
    {
        _ogImageService = ogImageService;
    }

    [HttpGet("session/{sessionId}")]
    public async Task<ActionResult<OgImageResponse>> GetSessionImage(string sessionId)
    {
        var url = await _ogImageService.GetOgImageUrlAsync(sessionId);
        return Ok(new OgImageResponse { Url = url });
    }

    [HttpGet("default")]
    public async Task<ActionResult<OgImageResponse>> GetDefaultImage()
    {
        var url = await _ogImageService.GetDefaultOgImageUrlAsync();
        return Ok(new OgImageResponse { Url = url });
    }
}

public class OgImageResponse
{
    public string Url { get; set; } = string.Empty;
}

