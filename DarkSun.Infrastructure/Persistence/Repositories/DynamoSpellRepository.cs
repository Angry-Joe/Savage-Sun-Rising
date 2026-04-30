using Amazon.DynamoDBv2.DataModel;
using DarkSun.Application.Interfaces;
using DarkSun.Domain.Entities;

namespace DarkSun.Infrastructure.Persistence.Repositories;

public class DynamoSpellRepository : ISpellRepository
{
    private readonly IDynamoDBContext _context;

    public DynamoSpellRepository(IDynamoDBContext context)
    {
        _context = context;
    }

    public async Task<DarkSunSpell?> GetByIdAsync(string id)
    {
        return await _context.LoadAsync<DarkSunSpell>(id);
    }

    public async Task<List<DarkSunSpell>> GetAllAsync(int? maxLevel = null)
    {
        var search = _context.ScanAsync<DarkSunSpell>(new List<ScanCondition>());

        var results = await search.GetRemainingAsync();

        if (maxLevel.HasValue)
            results = results.Where(s => s.Level <= maxLevel.Value).ToList();

        return results;
    }
}