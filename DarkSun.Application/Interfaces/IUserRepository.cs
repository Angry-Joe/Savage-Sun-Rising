using DarkSun.Domain.Entities;

namespace DarkSun.Application.Interfaces;

public interface IUserRepository
{
    Task<DarkSunUser?> GetByEmailAsync(string email);
    Task<DarkSunUser?> GetByIdAsync(string userId);
    Task SaveAsync(DarkSunUser user);
}
