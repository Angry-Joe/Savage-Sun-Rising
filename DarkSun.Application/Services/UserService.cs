// UserServices.cs
using DarkSun.Application.Interfaces;
using DarkSun.Domain.Entities;

namespace DarkSun.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<(bool Success, string? Error, DarkSunUser? User)> RegisterAsync(
        string email, string password, string fullName)
    {
        if (string.IsNullOrWhiteSpace(email))
            return (false, "Email is required.", null);
        if (string.IsNullOrWhiteSpace(password))
            return (false, "Password is required.", null);

        // Check if email already exists
        var existing = await _repository.GetByEmailAsync(email);
        if (existing != null)
            return (false, "An account with that email already exists.", null);

        var user = new DarkSunUser
        {
            UserId            = Guid.NewGuid().ToString(),
            Email             = email.ToLowerInvariant().Trim(),
            FullName          = fullName,
            Provider          = "Email",
            ProviderSubjectId = email.ToLowerInvariant().Trim(),
            PasswordHash      = BCrypt.Net.BCrypt.HashPassword(password),
            CreatedAt         = DateTime.UtcNow,
            LastLoginAt       = DateTime.UtcNow
        };

        await _repository.SaveAsync(user);
        return (true, null, user);
    }

    public async Task<(bool Success, string? Error, DarkSunUser? User)> LoginAsync(
        string email, string password)
    {
        var user = await _repository.GetByEmailAsync(email.ToLowerInvariant().Trim());

        if (user == null)
            return (false, "Invalid email or password.", null);

        if (user.Provider != "Email" || user.PasswordHash == null)
            return (false, $"This account uses {user.Provider} to sign in.", null);

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return (false, "Invalid email or password.", null);

        user.LastLoginAt = DateTime.UtcNow;
        await _repository.SaveAsync(user);

        return (true, null, user);
    }
}
