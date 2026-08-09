using System.Text.Json;
using System.Text.Json.Serialization;
using DarkSun.Application.Interfaces;
using DarkSun.Domain.Entities;

namespace DarkSun.Infrastructure.Persistence.Repositories;

/// <summary>
/// Loads spells from the local JSON content files under wwwroot/data.
/// No cloud dependencies — suitable for local development and the upcoming Postgres migration.
/// </summary>
public class LocalSpellRepository : ISpellRepository
{
    private List<DarkSunSpell>? _cache;
    private readonly object _lock = new();

    public Task<DarkSunSpell?> GetByIdAsync(string id)
    {
        var spells = LoadSpells();
        return Task.FromResult(spells.FirstOrDefault(s =>
            string.Equals(s.Id, id, StringComparison.OrdinalIgnoreCase)));
    }

    public Task<List<DarkSunSpell>> GetAllAsync(int? maxLevel = null)
    {
        var spells = LoadSpells();
        if (maxLevel.HasValue)
            spells = spells.Where(s => s.Level <= maxLevel.Value).ToList();
        return Task.FromResult(spells);
    }

    private List<DarkSunSpell> LoadSpells()
    {
        if (_cache != null) return _cache;

        lock (_lock)
        {
            if (_cache != null) return _cache;

            var path = ResolveSpellJsonPath();
            if (path == null || !File.Exists(path))
            {
                Console.WriteLine($"⚠️ Spell JSON not found. Searched from: {Directory.GetCurrentDirectory()}");
                _cache = new List<DarkSunSpell>();
                return _cache;
            }

            try
            {
                var json = File.ReadAllText(path);
                var dtos = JsonSerializer.Deserialize<List<SpellJsonDto>>(json,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                    }) ?? new List<SpellJsonDto>();

                _cache = dtos.Select(MapToEntity).ToList();
                Console.WriteLine($"✅ Loaded {_cache.Count} spells from {path}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to load spell JSON: {ex.Message}");
                _cache = new List<DarkSunSpell>();
            }

            return _cache;
        }
    }

    /// <summary>
    /// Tries several common locations so the repo works whether run from
    /// the solution root, the Web project folder, or a published output folder.
    /// </summary>
    private static string? ResolveSpellJsonPath()
    {
        var candidates = new[]
        {
            Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "priest-1st-level-spells.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "DarkSun.Web", "wwwroot", "data", "priest-1st-level-spells.json"),
            Path.Combine(AppContext.BaseDirectory, "wwwroot", "data", "priest-1st-level-spells.json"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "wwwroot", "data", "priest-1st-level-spells.json"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "DarkSun.Web", "wwwroot", "data", "priest-1st-level-spells.json"),
        };

        foreach (var candidate in candidates)
        {
            var full = Path.GetFullPath(candidate);
            if (File.Exists(full))
                return full;
        }

        return null;
    }

    private static DarkSunSpell MapToEntity(SpellJsonDto dto)
    {
        var spheres = dto.Spheres?
            .Select(s => $"{s.Name} ({s.Access})")
            .ToList() ?? new List<string>();

        return new DarkSunSpell
        {
            Id = dto.Id ?? Guid.NewGuid().ToString(),
            Name = dto.Name ?? "Unknown",
            SrdIndex = dto.SrdIndex,
            Level = dto.Level,
            School = dto.School ?? string.Empty,
            SpheresJson = spheres,
            CastingTime = dto.CastingTime ?? string.Empty,
            Range = dto.Range ?? string.Empty,
            Components = dto.Components ?? new List<string>(),
            Duration = dto.Duration ?? string.Empty,
            Concentration = dto.Concentration,
            Ritual = dto.Ritual,
            Description = dto.Description ?? string.Empty,
            HigherLevel = dto.HigherLevel,
            ModifiedEffect = dto.AthasianVariant?.ModifiedEffect,
            MaterialComponentAthas = dto.AthasianVariant?.MaterialComponentAthas,
            DefilerCost = dto.AthasianVariant?.DefilerCost ?? 0,
            PlaneSource = dto.AthasianVariant?.PlaneSource,
            FlavorLore = dto.FlavorLore ?? string.Empty,
            ArtworkPrompt = dto.ArtworkPrompt ?? string.Empty,
            Tags = dto.Tags ?? new List<string>(),
            RelatedEntries = dto.RelatedEntries ?? new List<string>(),
            SourceBooks = dto.SourceBooks ?? new List<string>(),
            LastUpdated = DateTime.UtcNow
        };
    }

    // DTOs that match the current JSON schema exactly
    private class SpellJsonDto
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? SrdIndex { get; set; }
        public int Level { get; set; }
        public string? School { get; set; }
        public List<SphereDto>? Spheres { get; set; }
        public string? CastingTime { get; set; }
        public string? Range { get; set; }
        public List<string>? Components { get; set; }
        public string? Duration { get; set; }
        public bool Concentration { get; set; }
        public bool Ritual { get; set; }
        public string? Description { get; set; }
        public string? HigherLevel { get; set; }
        public AthasianVariantDto? AthasianVariant { get; set; }
        public string? FlavorLore { get; set; }
        public string? ArtworkPrompt { get; set; }
        public List<string>? Tags { get; set; }
        public List<string>? RelatedEntries { get; set; }
        public List<string>? SourceBooks { get; set; }
    }

    private class SphereDto
    {
        public string? Name { get; set; }
        public string? Access { get; set; }
    }

    private class AthasianVariantDto
    {
        public string? ModifiedEffect { get; set; }
        public string? MaterialComponentAthas { get; set; }
        public int DefilerCost { get; set; }
        public string? PlaneSource { get; set; }
    }
}
