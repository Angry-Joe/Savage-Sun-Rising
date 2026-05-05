using DarkSun.Application.Interfaces;
using DarkSun.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace DarkSun.Application.Services;

public class UserService : IUserService
{
    private readonly ILogger<UserService> _logger;

    // In-memory storage (works 100% for demo/turn-in)
    private static readonly Dictionary<string, DarkSunUser> _users = new();

    public UserService(ILogger<UserService> logger)
    {
        _logger = logger;
    }

    public Task<(bool Success, string? Error, DarkSunUser? User)> LoginAsync(string email, string password)
    {
        email = email?.Trim().ToLower() ?? "";

        if (_users.TryGetValue(email, out var user))
        {
            user.LastLoginAt = DateTime.UtcNow;
            return Task.FromResult((true, (string?)null, user));
        }

        // Auto-create user on first login (demo mode)
        var newUser = new DarkSunUser
        {
            UserId = Guid.NewGuid().ToString(),
            Email = email,
            DisplayName = email.Split('@')[0],
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            Provider = "Local"
        };

        _users[email] = newUser;
        return Task.FromResult((true, (string?)null, newUser));
    }

    public Task<(bool Success, string? Error, DarkSunUser? User)> RegisterAsync(
        string email, string password, string? displayName)
    {
        email = email?.Trim().ToLower() ?? "";

        if (_users.ContainsKey(email))
            return Task.FromResult((false, "An account with this email already exists.", (DarkSunUser?)null));

        var newUser = new DarkSunUser
        {
            UserId = Guid.NewGuid().ToString(),
            Email = email,
            DisplayName = displayName ?? email.Split('@')[0],
            PasswordHash = password,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            Provider = "Local"
        };

        _users[email] = newUser;
        return Task.FromResult((true, (string?)null, newUser));
    }

    public Task<(bool Success, string? Error, DarkSunUser? User)> FindOrCreateExternalUserAsync(
        string email, string? displayName)
    {
        email = email?.Trim().ToLower() ?? "";

        if (_users.TryGetValue(email, out var existing))
        {
            existing.LastLoginAt = DateTime.UtcNow;
            return Task.FromResult((true, (string?)null, existing));
        }

        var newUser = new DarkSunUser
        {
            UserId = Guid.NewGuid().ToString(),
            Email = email,
            DisplayName = displayName ?? email.Split('@')[0],
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            Provider = "External"
        };

        _users[email] = newUser;
        return Task.FromResult((true, (string?)null, newUser));
    }
}