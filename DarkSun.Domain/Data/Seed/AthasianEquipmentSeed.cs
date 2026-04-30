// AthasianEquipmentSeed.cs
using DarkSun.Domain.Entities;
using System.Collections.Generic;
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
            }
        };
    }
} // namespace DarkSun.Domain.Data.Seed