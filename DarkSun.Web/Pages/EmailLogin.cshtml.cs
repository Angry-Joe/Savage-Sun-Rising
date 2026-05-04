// EmailLogin.cshtml.cs
using System.Security.Claims;
using DarkSun.Application.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace DarkSun.Web.Pages;

public class EmailLoginModel : PageModel
{
    private readonly IUserService _userService;

    public EmailLoginModel(IUserService userService)
    {
        _userService = userService;
    }

    // POST /EmailLogin?action=register OR ?action=login
    public async Task<IActionResult> OnGetAsync(
        string action,
        string email,
        string password,
        string? fullName,
        string returnUrl = "/")
    {
        if (string.IsNullOrWhiteSpace(email))
            return Redirect($"/login?error={Uri.EscapeDataString("Email is required.")}");

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return Redirect($"/login?error={Uri.EscapeDataString("Email and password are required.")}");

        if (action == "register")
        {
            var (success, error, user) = await _userService.RegisterAsync(email, password, fullName ?? email);
            if (!success)
                return Redirect($"/login?error={Uri.EscapeDataString(error!)}");

            await SignInUserAsync(user!.UserId, user.Email, user.FullName ?? user.Email);
        }
        else
        {
            var (success, error, user) = await _userService.LoginAsync(email, password);
            if (!success)
                return Redirect($"/login?error={Uri.EscapeDataString(error!)}");

            await SignInUserAsync(user!.UserId, user.Email, user.FullName ?? user.Email);
        }

        return LocalRedirect(returnUrl);
    }

    private async Task SignInUserAsync(string userId, string email, string name)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Name, name),
        };

        var identity  = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal,
            new AuthenticationProperties { IsPersistent = true });
    }
}
