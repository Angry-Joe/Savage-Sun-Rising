using Amazon.DynamoDBv2.DataModel;

namespace DarkSun.Domain.Entities;

[DynamoDBTable("DarkSunSpells")]
public class DarkSunSpell
{
    [DynamoDBHashKey]
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? SrdIndex { get; set; }
    public int Level { get; set; }
    public string School { get; set; } = string.Empty;
    public List<string> SpheresJson { get; set; } = new();
    public string CastingTime { get; set; } = string.Empty;
    public string Range { get; set; } = string.Empty;
    public List<string> Components { get; set; } = new();
    public string Duration { get; set; } = string.Empty;
    public bool Concentration { get; set; }
    public bool Ritual { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? HigherLevel { get; set; }
    public string? ModifiedEffect { get; set; }
    public string? MaterialComponentAthas { get; set; }
    public int DefilerCost { get; set; }
    public string? PlaneSource { get; set; }
    public string FlavorLore { get; set; } = string.Empty;
    public string ArtworkPrompt { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public List<string> RelatedEntries { get; set; } = new();
    public List<string> SourceBooks { get; set; } = new();
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}