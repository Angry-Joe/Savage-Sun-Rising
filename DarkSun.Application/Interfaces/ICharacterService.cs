using DarkSun.Domain.Entities;

namespace DarkSun.Application.Interfaces
{
    public interface ICharacterService
    {
        Task SaveCharacterAsync(CharacterSheet character, string userId);
        Task<CharacterSheet?> GetByIdAsync(string id, string userId);
        Task<List<CharacterSheet>> GetAllByUserAsync(string userId);
    }
}