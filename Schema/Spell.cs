// Domain/Entities/Spell.cs
public record DarkSunSpell
{
    [DynamoDBHashKey] public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type => "Spell";
    public int Level { get; init; }
    public List<string> Spheres { get; init; } = new();
    public string School { get; init; } = string.Empty;
    public string Source { get; init; } = string.Empty;
    public string CastingTime { get; init; } = string.Empty;
    public string Range { get; init; } = string.Empty;
    public string Components { get; init; } = string.Empty;
    public string? Material { get; init; }
    public string Duration { get; init; } = string.Empty;
    public bool Concentration { get; init; }
    public bool Ritual { get; init; }
    public string Description { get; init; } = string.Empty;
    public string? AtHigherLevels { get; init; }
    public string? AthasianNotes { get; init; }
    public string FlavorText { get; init; } = string.Empty;
    public string ArtworkPrompt { get; init; } = string.Empty;
    public List<string> Tags { get; init; } = new();
    public List<string> RelatedEntries { get; init; } = new();
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; init; } = DateTime.UtcNow;
}
