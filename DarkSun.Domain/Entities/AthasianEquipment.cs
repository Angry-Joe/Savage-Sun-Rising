public class AthasianEquipment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Weapon, Armor, Tool, Adventuring Gear, Mount, etc.
    public string ShortDescription { get; set; } = string.Empty;
    public string Cost { get; set; } = string.Empty; // e.g. "15 cp" or "1 sp"
    public string Weight { get; set; } = string.Empty;
    public string[] Properties { get; set; } = Array.Empty<string>(); // Finesse, Light, Two-Handed, etc.
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsStartingGear { get; set; } = false;
}