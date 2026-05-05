//@* IUserService interface *@
using DarkSun.Domain.Entities;

namespace DarkSun.Application.Interfaces;

public interface IUserService
{
    Task<(bool Success, string? Error, DarkSunUser? User)> LoginAsync(
        string email, string password);

    Task<(bool Success, string? Error, DarkSunUser? User)> RegisterAsync(
        string email, string password, string? displayName);

    Task<(bool Success, string? Error, DarkSunUser? User)> FindOrCreateExternalUserAsync(
        string email, string? displayName);
}
