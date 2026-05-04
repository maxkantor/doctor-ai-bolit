using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using DoctorAIBolit.Models;

namespace DoctorAIBolit.Repositories;

public class ContactRepository : IContactRepository
{
    private readonly IDynamoDBContext _context;

    public ContactRepository(IAmazonDynamoDB dynamoDbClient)
    {
        var config = new DynamoDBContextConfig
        {
            DisableFetchingTableMetadata = true
        };
        _context = new DynamoDBContext(dynamoDbClient, config);
    }

    public async Task SaveContactMessageAsync(ContactMessage message)
    {
        await _context.SaveAsync(message);
    }

    public async Task<List<ContactMessage>> GetAllContactMessagesAsync()
    {
        var scan = _context.ScanAsync<ContactMessage>(new List<ScanCondition>());
        return await scan.GetRemainingAsync();
    }

    public async Task<ContactMessage?> GetContactMessageByIdAsync(string messageId)
    {
        return await _context.LoadAsync<ContactMessage>(messageId);
    }

    public async Task UpdateContactMessageStatusAsync(string messageId, string status)
    {
        var message = await GetContactMessageByIdAsync(messageId);
        if (message == null)
        {
            throw new InvalidOperationException($"Contact message with id '{messageId}' not found");
        }

        message.Status = status;
        await _context.SaveAsync(message);
    }
}

