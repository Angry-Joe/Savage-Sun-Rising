using DarkSun.Application.Interfaces;
using DarkSun.Domain.Entities;

namespace DarkSun.Infrastructure.Persistence.Repositories;

/// <summary>
/// Simple in-memory user store for local development.
/// Note: UserService already maintains its own static dictionary for login/register;
/// this repository exists so DI registration succeeds and future code can use it.
/// </summary>
public class LocalUserRepository : IUserRepository
{
    private static readonly Dictionary<string, DarkSunUser> _byId = new();
    private static readonly Dictionary<string, DarkSunUser> _byEmail = new();
    private static readonly object _lock = new();

    public Task<DarkSunUser?> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return Task.FromResult<DarkSunUser?>(null);
        var key = email.Trim().ToLowerInvariant();
        lock (_lock)
        {
            _byEmail.TryGetValue(key, out var user);
            return Task.FromResult(user);
        }
    }

    public Task<DarkSunUser?> GetByIdAsync(string userId)
    {
        lock (_lock)
        {
            _byId.TryGetValue(userId, out var user);
            return Task.FromResult(user);
        }
    }

    public Task CreateAsync(DarkSunUser user) => SaveAsync(user);

    public Task UpdateAsync(DarkSunUser user) => SaveAsync(user);

    public Task SaveAsync(DarkSunUser user)
    {
        if (string.IsNullOrEmpty(user.UserId))
            user.UserId = Guid.NewGuid().ToString();

        var emailKey = user.Email?.Trim().ToLowerInvariant() ?? string.Empty;

        lock (_lock)
        {
            _byId[user.UserId] = user;
            if (!string.IsNullOrEmpty(emailKey))
                _byEmail[emailKey] = user;
        }

        return Task.CompletedTask;
    }
}
