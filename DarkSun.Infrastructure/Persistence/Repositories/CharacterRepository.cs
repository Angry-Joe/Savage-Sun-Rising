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

        public async Task<CharacterSheet?> GetByIdAsync(string CharId, string userId)
        {
            return await _context.LoadAsync<CharacterSheet>(userId, CharId);
        }

        // New Guid version (recommended)
        public async Task<CharacterSheet?> GetByIdAsync(Guid charId, string userId)
        {
            string idStr = charId.ToString();
            var character = await _context.LoadAsync<CharacterSheet>(userId, idStr);

            if (character == null)
            {
                // Optional: log here
                Console.WriteLine($"Character {charId} not found for user {userId}");
            }

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

    }
}