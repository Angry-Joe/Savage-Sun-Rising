public static class AthasianBackgrounds
{
    public static readonly IReadOnlyList<AthasianBackground> All = new List<AthasianBackground>
    {
        new() { Name = "Dune Trader", ShortDescription = "Member of a merchant house navigating the deadly trade routes.", Skills = new[] { "Persuasion", "Deception" }, Tools = new[] { "Vehicles (Land)" }, Feature = "Merchant's Eye" },
        new() { Name = "Gladiator", ShortDescription = "Veteran of the brutal arenas of Tyr, Urik, or Nibenay.", Skills = new[] { "Athletics", "Intimidation" }, Feature = "Arena Reputation" },
        new() { Name = "Tribal Outcast", ShortDescription = "Exiled from your tribe — now a wanderer of the wastes.", Skills = new[] { "Survival", "Nature" }, Feature = "Wasteland Survivor" },
        new() { Name = "Templar Initiate", ShortDescription = "Low-ranking servant of a Sorcerer-King.", Skills = new[] { "Intimidation", "Religion" }, Feature = "Authority of the King" },
        new() { Name = "Veiled Alliance Member", ShortDescription = "Secret preserver fighting defilers in the shadows.", Skills = new[] { "Arcana", "Stealth" }, Feature = "Hidden Network" }
    };
}