namespace DarkSun.Domain.Entities
{
    public class AthasianRace
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Subtype { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public string[] KeyTraits { get; set; } = Array.Empty<string>();
        public string ImageUrl { get; set; } = string.Empty;
        // Add more later: Ability bonuses, Speed, Size, Languages, etc.
    }
}
