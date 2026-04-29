// DarkSun.Infrastructure/Persistence/Seeders/SpellSeederService.cs
using Amazon.DynamoDBv2.DataModel;
using DarkSun.Domain.Entities;
using System.Text.Json;

namespace DarkSun.Infrastructure.Persistence.Seeders;

public class SpellSeederService
{
    private readonly IDynamoDBContext _dynamoContext;
    private readonly string _seedPath = "wwwroot/data/priest-1st-level-spells.json";

    public SpellSeederService(IDynamoDBContext dynamoContext)
    {
        _dynamoContext = dynamoContext;
    }

    public async Task SeedAsync(bool forceOverwrite = false)
    {
        if (!File.Exists(_seedPath))
        {
            Console.WriteLine("⚠️ Seed file not found");
            return;
        }

        var json = await File.ReadAllTextAsync(_seedPath);
        var spells = JsonSerializer.Deserialize<List<DarkSunSpell>>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (spells == null) return;

        foreach (var spell in spells)
        {
            spell.LastUpdated = DateTime.UtcNow;
            await _dynamoContext.SaveAsync(spell);
            Console.WriteLine($"✅ Seeded: {spell.Name}");
        }

        Console.WriteLine($"🎉 Successfully seeded {spells.Count} priest spells!");
    }
}
//using Amazon.DynamoDBv2.DataModel;
//using DarkSun.Domain.Entities;
//using System.Text.Json;

//namespace DarkSun.Infrastructure.Persistence.Seeders;

//public class SpellSeederService
//{
//    private readonly IDynamoDBContext _dynamoContext;
//    private readonly string _seedPath = "wwwroot/data/priest-1st-level-spells.json";

//    public SpellSeederService(IDynamoDBContext dynamoContext)
//    {
//        _dynamoContext = dynamoContext;
//    }

//    public async Task SeedAsync(bool forceOverwrite = false)
//    {
//        if (!File.Exists(_seedPath))
//        {
//            Console.WriteLine("⚠️ Seed file not found at " + _seedPath);
//            return;
//        }

//        var json = await File.ReadAllTextAsync(_seedPath);
//        var spells = JsonSerializer.Deserialize<List<DarkSunSpell>>(json,
//            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

//        if (spells == null || spells.Count == 0) return;

//        foreach (var spell in spells)
//        {
//            spell.LastUpdated = DateTime.UtcNow;
//            await _dynamoContext.SaveAsync(spell);
//            Console.WriteLine($"✅ Seeded: {spell.Name}");
//        }

//        Console.WriteLine($"🎉 Successfully seeded {spells.Count} priest spells!");
//    }
//}