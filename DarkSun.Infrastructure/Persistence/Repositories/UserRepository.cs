using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DarkSun.Application.Interfaces;
using DarkSun.Domain.Entities;

namespace DarkSun.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDynamoDBContext _context;

    public UserRepository(IDynamoDBContext context)
    {
        _context = context;
    }

    public async Task<DarkSunUser?> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        var search = _context.ScanAsync<DarkSunUser>(new[]
        {
            new ScanCondition("Email", ScanOperator.Equal, email.ToLowerInvariant().Trim())
        });
        var results = await search.GetRemainingAsync();
        return results.FirstOrDefault();
    }

    public async Task<DarkSunUser?> GetByIdAsync(string userId)
    {
        return await _context.LoadAsync<DarkSunUser>(userId);
    }

    public async Task SaveAsync(DarkSunUser user)
    {
        await _context.SaveAsync(user);
    }
}
