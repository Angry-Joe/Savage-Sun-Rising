// IUserRepository.cs
using DarkSun.Domain.Entities;
namespace DarkSun.Application.Interfaces;

public interface IUserRepository
{
    Task<DarkSunUser?> GetByEmailAsync(string email);
    Task<DarkSunUser?> GetByIdAsync(string userId);
    Task CreateAsync(DarkSunUser user);
    Task UpdateAsync(DarkSunUser user);
    Task SaveAsync(DarkSunUser user); // keep for backward compatibility
}