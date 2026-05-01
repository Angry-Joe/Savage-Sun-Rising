using Amazon.DynamoDBv2.DataModel;

namespace DarkSun.Domain.Entities;

[DynamoDBTable("Users")]
public class DarkSunUser
{
    [DynamoDBHashKey]
    public string UserId { get; set; } = Guid.NewGuid().ToString();

    // Authentication
    public string Email { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty; // "Google", "Microsoft", "Email"
    public string ProviderSubjectId { get; set; } = string.Empty; // OAuth "sub" claim
    public string? PasswordHash { get; set; } // only for email logins

    // Profile
    public string FullName { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }

    // Characters
    public List<string> CharacterIds { get; set; } = new(); // CharId GUIDs owned by this user

    // Campaigns
    public List<string> DungeonMasterCampaignIds { get; set; } = new(); // campaigns this user DMs
    public List<string> PlayerCampaignIds { get; set; } = new();        // campaigns this user plays in

    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
}
