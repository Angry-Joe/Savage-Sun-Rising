using DarkSun.Application.Interfaces;
using DarkSun.Domain.Entities;

namespace DarkSun.Infrastructure.Persistence.Repositories;

/// <summary>
/// Simple in-memory character store for local development.
/// Data is lost when the process restarts — sufficient until Postgres is wired up.
/// </summary>
public class LocalCharacterRepository : ICharacterRepository
{
    private static readonly Dictionary<string, CharacterSheet> _store = new();
    private static readonly object _lock = new();

    public Task SaveAsync(CharacterSheet character)
    {
        if (string.IsNullOrEmpty(character.CharId))
            character.CharId = Guid.NewGuid().ToString();

        character.UpdatedAt = DateTime.UtcNow;

        lock (_lock)
        {
            _store[character.CharId] = character;
        }

        Console.WriteLine($"✅ Saved character locally: {character.Name} ({character.CharId})");
        return Task.CompletedTask;
    }

    public Task<CharacterSheet?> GetByIdAsync(string charId, string userId)
    {
        lock (_lock)
        {
            if (_store.TryGetValue(charId, out var character)
                && character.UserId == userId)
            {
                return Task.FromResult<CharacterSheet?>(character);
            }
        }
        return Task.FromResult<CharacterSheet?>(null);
    }

    public Task<CharacterSheet?> GetByIdAsync(Guid charId, string userId)
    {
        return GetByIdAsync(charId.ToString(), userId);
    }

    public Task<List<CharacterSheet>> GetAllByUserAsync(string userId)
    {
        lock (_lock)
        {
            var results = _store.Values
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
                .ToList();
            return Task.FromResult(results);
        }
    }
}
