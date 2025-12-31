namespace DoctorAIBolit.Models;

public class ChatResponse
{
    public string Message { get; set; } = string.Empty;
    public int RemainingMessages { get; set; }
    public bool RequiresPayment { get; set; }
}

