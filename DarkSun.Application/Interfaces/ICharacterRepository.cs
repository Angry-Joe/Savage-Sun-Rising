using DarkSun.Domain.Entities;

namespace DarkSun.Application.Interfaces
{
    public interface ICharacterRepository
    {
        Task SaveAsync(CharacterSheet character);
        Task<CharacterSheet?> GetByIdAsync(string id, string userId);
        Task<List<CharacterSheet>> GetAllByUserAsync(string userId);
    }
}