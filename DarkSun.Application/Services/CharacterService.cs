//CharacterService.cs
using DarkSun.Application.Interfaces;
using DarkSun.Domain.Entities;

namespace DarkSun.Application.Services
{
    public class CharacterService : ICharacterService
    {
        private readonly ICharacterRepository _repository;

        public CharacterService(ICharacterRepository repository)
        {
            _repository = repository;
        }

        public async Task SaveCharacterAsync(CharacterSheet character, string userId)
        {
            character.UserId = userId;
            await _repository.SaveAsync(character);
        }

        public Task<CharacterSheet?> GetByIdAsync(string charId, string userId) =>
            _repository.GetByIdAsync(charId, userId);

        public Task<List<CharacterSheet>> GetAllByUserAsync(string userId) =>
            _repository.GetAllByUserAsync(userId);

    }
}