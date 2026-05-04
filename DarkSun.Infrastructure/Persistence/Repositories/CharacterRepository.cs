using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DarkSun.Application.Interfaces;
using DarkSun.Domain.Entities;

namespace DarkSun.Infrastructure.Persistence.Repositories
{
    public class CharacterRepository : ICharacterRepository
    {
        private readonly IDynamoDBContext _context;

        public CharacterRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task SaveAsync(CharacterSheet character)
        {
            if (string.IsNullOrEmpty(character.CharId))
                character.CharId = Guid.NewGuid().ToString();
            await _context.SaveAsync(character);
        }

        /// <summary>
        /// Loads a character by its hash key (CharId) and validates ownership.
        /// </summary>
        public async Task<CharacterSheet?> GetByIdAsync(string charId, string userId)
        {
            // CharId is the DynamoDB hash key — load directly by it
            var character = await _context.LoadAsync<CharacterSheet>(charId);

            // Validate the character belongs to the requesting user
            if (character != null && character.UserId != userId)
                return null;

            return character;
        }

        public async Task<List<CharacterSheet>> GetAllByUserAsync(string userId)
        {
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("UserId", ScanOperator.Equal, userId)
            };
            var results = await _context.ScanAsync<CharacterSheet>(conditions).GetRemainingAsync();
            return results ?? new List<CharacterSheet>();
        }

        public Task<CharacterSheet?> GetByIdAsync(Guid CharId, string userId)
        {
            throw new NotImplementedException();
        }
    }
}