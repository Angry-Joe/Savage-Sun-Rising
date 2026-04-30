namespace DarkSun.Domain.Entities;

public class CharacterSheet
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Race { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public int Level { get; set; } = 1;
    public Dictionary<string, int> AbilityScores { get; set; } = new();
    public string Background { get; set; } = string.Empty;
    public List<string> Equipment { get; set; } = new();
    public List<DarkSunSpell> KnownSpells { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}