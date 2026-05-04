// TODO: Add validation attributes to properties (e.g., [Required], [StringLength]) to enforce data integrity and constraints.
// TODO: Manage UserId properly, possibly through authentication context or user session management, instead of hardcoding it.
// TODO: Consider adding methods for updating timestamps (CreatedAt, UpdatedAt) automatically when the entity is modified.
//using System.Collections.Generic;
using Amazon.DynamoDBv2.DataModel;
namespace DarkSun.Domain.Entities;

[DynamoDBTable("CharacterSheets")]
public class CharacterSheet
{
    [DynamoDBHashKey]
    public string CharId { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty; // FK to Users table
    public string CampaignId { get; set; } = "default";
    public string Name { get; set; } = "Unnamed Hero";
    public AthasianRace? Race { get; set; }
    public AthasianClass? Class { get; set; }
    public AthasianBackground? Background { get; set; }
    public Dictionary<string, int> AbilityScores { get; set; } = new();
    public List<AthasianEquipment> Skills { get; set; } = new();
    public List<AthasianEquipment> Equipment { get; set; } = new();
    public string Alignment { get; set; } = "Neutral";
    public int Level { get; set; } = 1;
    public int Experience { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}