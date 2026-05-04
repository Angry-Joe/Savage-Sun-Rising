using DarkSun.Domain.Entities;

namespace DarkSun.Application.Interfaces
{
    public interface ICharacterRepository
    {
        Task SaveAsync(CharacterSheet character);
        Task<CharacterSheet?> GetByIdAsync(Guid CharId, string userId);
        Task<List<CharacterSheet>> GetAllByUserAsync(string userId);
        Task<CharacterSheet?> GetByIdAsync(string charId, string userId);
        //Task<CharacterSheet?> GetByIdAsync(Guid charId, string userId);
    }
}