public class AthasianBackground
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Source { get; set; } = "Dark Sun"; // or specific book
    public string[] Skills { get; set; } = Array.Empty<string>();
    public string[] Tools { get; set; } = Array.Empty<string>();
    public string Feature { get; set; } = string.Empty;
}