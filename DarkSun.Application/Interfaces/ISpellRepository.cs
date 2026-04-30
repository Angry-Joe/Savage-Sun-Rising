using DarkSun.Domain.Entities;

namespace DarkSun.Application.Interfaces;

public interface ISpellRepository
{
    Task<DarkSunSpell?> GetByIdAsync(string id);

    // New method
    Task<List<DarkSunSpell>> GetAllAsync(int? maxLevel = null);
}