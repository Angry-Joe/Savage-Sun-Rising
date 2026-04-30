namespace DarkSun.Domain.Entities
{
    public class AthasianClass
    {
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public string[] KeyTraits { get; set; } = Array.Empty<string>();
        public string ImageUrl { get; set; } = string.Empty;
    }
}
