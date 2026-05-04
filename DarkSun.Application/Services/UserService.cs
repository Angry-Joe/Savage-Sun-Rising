// UserServices.cs
using System.Security.Claims;
using DarkSun.Application.Interfaces;
using DarkSun.Domain.Entities;
// New additions
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
namespace DarkSun.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly IHttpContextAccessor _httpContextAccessor; // New

    //public UserService(IUserRepository repository)
    //{
    //    _repository = repository;
    //}
    public UserService(IUserRepository repository, IHttpContextAccessor httpContextAccessor)
    {
        _repository = repository;
        _httpContextAccessor = httpContextAccessor;
    }

    //public async Task<(bool Success, string? Error, DarkSunUser? User)> RegisterAsync(
    //    string email, string password, string fullName)
    //{
    //    if (string.IsNullOrWhiteSpace(email))
    //        return (false, "Email is required.", null);
    //    if (string.IsNullOrWhiteSpace(password))
    //        return (false, "Password is required.", null);

    //    // Check if email already exists
    //    var existing = await _repository.GetByEmailAsync(email);
    //    if (existing != null)
    //        return (false, "An account with that email already exists.", null);

    //    var user = new DarkSunUser
    //    {
    //        UserId            = Guid.NewGuid().ToString(),
    //        Email             = email.ToLowerInvariant().Trim(),
    //        FullName          = fullName,
    //        Provider          = "Email",
    //        ProviderSubjectId = email.ToLowerInvariant().Trim(),
    //        PasswordHash      = BCrypt.Net.BCrypt.HashPassword(password),
    //        CreatedAt         = DateTime.UtcNow,
    //        LastLoginAt       = DateTime.UtcNow
    //    };

    //    await _repository.SaveAsync(user);
    //    return (true, null, user);
    //}
    public async Task<(bool Success, string? Error, DarkSunUser? User)> RegisterAsync(
            string email, string password, string fullName)
    {
        if (string.IsNullOrWhiteSpace(email)) return (false, "Email is required.", null);
        if (string.IsNullOrWhiteSpace(password)) return (false, "Password is required.", null);

        var existing = await _repository.GetByEmailAsync(email.ToLowerInvariant().Trim());
        if (existing != null)
            return (false, "An account with that email already exists.", null);

        var user = new DarkSunUser
        {
            UserId = Guid.NewGuid().ToString(),
            Email = email.ToLowerInvariant().Trim(),
            FullName = fullName,
            Provider = "Email",
            ProviderSubjectId = email.ToLowerInvariant().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };

        await _repository.SaveAsync(user);

        await SignInUserAsync(user);   // ← Call it here

        return (true, null, user);
    }

    //public async Task<(bool Success, string? Error, DarkSunUser? User)> LoginAsync(
    //    string email, string password)
    //{
    //    var user = await _repository.GetByEmailAsync(email.ToLowerInvariant().Trim());

    //    if (user == null) return (false, "Invalid email or password.", null);

    //    if (user.Provider != "Email" || user.PasswordHash == null)
    //        return (false, $"This account uses {user.Provider} to sign in.", null);

    //    if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
    //        return (false, "Invalid email or password.", null);


    //    user.LastLoginAt = DateTime.UtcNow;
    //    await _repository.SaveAsync(user);

    //    return (true, null, user);
    //}
    public async Task<(bool Success, string? Error, DarkSunUser? User)> LoginAsync(
        string email, string password)
    {
        var user = await _repository.GetByEmailAsync(email.ToLowerInvariant().Trim());

        if (user == null) return (false, "Invalid email or password.", null);
        if (user.Provider != "Email" || user.PasswordHash == null)
            return (false, $"This account uses {user.Provider} to sign in.", null);
        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return (false, "Invalid email or password.", null);

        user.LastLoginAt = DateTime.UtcNow;
        await _repository.SaveAsync(user);

        await SignInUserAsync(user);   // ← Call it here too

        return (true, null, user);
    }
    private async Task SignInUserAsync(DarkSunUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName ?? user.Email),
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await _httpContextAccessor.HttpContext!.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties { IsPersistent = true });
    }

}
