//@* IUserService interface *@
using DarkSun.Domain.Entities;
namespace DarkSun.Application.Interfaces;

public interface IUserService
{
    Task<(bool Success, string? Error, DarkSunUser? User)> RegisterAsync(string email, string password, string fullName);
    Task<(bool Success, string? Error, DarkSunUser? User)> LoginAsync(string email, string password);
}
