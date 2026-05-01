// AthasianEquipmentSeed.cs
using System.Collections.Generic;
using System.Xml.Linq;
using DarkSun.Domain.Entities;
namespace DarkSun.Domain.Data.Seed
{
    public static class AthasianEquipmentSeed
    {
        public static readonly IReadOnlyList<AthasianEquipment> All = new List<AthasianEquipment>
        {
            new AthasianEquipment
            {
                Name = "Bone Longsword",
                Category = "Weapon",
                ShortDescription = "Heavy bone blade favored by gladiators.",
                Cost = "15 cp",
                Weight = "4 lb",
                Properties = new[] { "Versatile (1d10)" },
                ImageUrl = "https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Bone+Longsword"
            },
            new AthasianEquipment
            {
                Name = "Obsidian Dagger",
                Category = "Weapon",
                ShortDescription = "Razor-sharp volcanic glass.",
                Cost = "2 cp",
                Weight = "1 lb",
                Properties = new[] { "Finesse", "Light", "Thrown (20/60)" },
                ImageUrl = "https://via.placeholder.com/300x200/2F4F4F/FFFFFF?text=Obsidian+Dagger"
            },
            new AthasianEquipment
            {
                Name = "Chitin Plate",
                Category = "Armor",
                ShortDescription = "Armor crafted from giant insect carapace.",
                Cost = "50 cp",
                Weight = "25 lb",
                Properties = new[] { "Medium Armor" },
                ImageUrl = "https://via.placeholder.com/300x200/4B0082/FFFFFF?text=Chitin+Plate"
            },
            new AthasianEquipment
            {
                Name = "Waterskin (Full)",
                Category = "Adventuring Gear",
                ShortDescription = "Holds 4 days of water — vital on Athas.",
                Cost = "2 cp",
                Weight = "5 lb",
                ImageUrl = "https://via.placeholder.com/300x200/4682B4/FFFFFF?text=Waterskin"
            },
            new AthasianEquipment
            {
                Name = "Kank (Mount)",
                Category = "Mount",
                ShortDescription = "Reliable insect mount used by traders.",
                Cost = "50 sp",
                Weight = "—",
                ImageUrl = "https://via.placeholder.com/300x200/228B22/FFFFFF?text=Kank"
            },
            new AthasianEquipment
            {
                Name = "Crodlu",
                Category = "Mount",
                ShortDescription = "A raptor-like mount, fast and aggressive.",
                Cost = "100 cp",
                Weight = "—",
                ImageUrl = "https://via.placeholder.com/300x200/8B0000/FFFFFF?text=Crodlu"
            },
            new AthasianEquipment
            {
                Name = "Inix",
                Category = "Mount",
                ShortDescription = "A massive lizard used as a pack animal or war mount.",
                Cost = "150 cp",
                Weight = "—",
                ImageUrl = "https://via.placeholder.com/300x200/8B0000/FFFFFF?text=Inix"
            },
            new AthasianEquipment
            {
                 Name = "Stone Axe",
                Category = "Weapon",
                ShortDescription = "Chipped obsidian edge on a hardwood haft.",
                Cost = "3 cp",
                Weight = "2 lb",
                Properties = new[] { "Light", "Thrown" },
                ImageUrl = "https://via.placeholder.com/300x200/8B0000/FFFFFF?text=Stone+Axe",
                IsStartingGear = true
            },
            new AthasianEquipment
            {
                Name = "Gouge",
                Category = "Weapon",
                ShortDescription = "A brutal two-handed cleaver favored by gladiators.",
                Cost = "10 cp",
                Weight = "6 lb",
                Properties = new[] { "Two-Handed", "Heavy" },
                IsStartingGear = true
            },
            new AthasianEquipment
            {
                Name = "Leather Armor",
                Category = "Armor",
                ShortDescription = "Dried kank hide shaped into basic protection.",
                Cost = "10 cp",
                Weight = "10 lb",
                Properties = new[] { "AC 11" },
                IsStartingGear = true
            },
            new AthasianEquipment
            {
                Name = "Bone Breastplate",
                Category = "Armor",
                ShortDescription = "Layered giant bone plates — heavy but effective.",
                Cost = "40 cp",
                Weight = "20 lb",
                Properties = new[] { "AC 14", "Str 13 required" },
                IsStartingGear = true
            },
            new AthasianEquipment
            {
                Name = "Sungoggles",
                Category = "Adventuring Gear",
                ShortDescription = "Reduces glare from the crimson sun. Carved bone and leather.",
                Cost = "5 cp",
                Weight = "0 lb",
                Properties = new[] { "Sun protection" },
                IsStartingGear = true
            },
            new AthasianEquipment
            {
                Name = "Rope (50 ft)",
                Category = "Adventuring Gear",
                ShortDescription = "Braided kank silk — lightweight and strong.",
                Cost = "1 cp",
                Weight = "10 lb",
                Properties = new[] { "Climbing" },
                IsStartingGear = true
            }
        };
    }
} // namespace DarkSun.Domain.Data.Seed