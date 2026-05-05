using System.Security.Claims;
using Amazon.DynamoDBv2.DataModel;
using DarkSun.Application.Interfaces;
using DarkSun.Domain.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
namespace DarkSun.Web.Pages;

public class ExternalLoginCallbackModel : PageModel
{
    private readonly IUserService _userService;
    private readonly ILogger<ExternalLoginCallbackModel> _logger;
    public ExternalLoginCallbackModel(
        IUserService userService,
        ILogger<ExternalLoginCallbackModel> logger)
    {
        _userService = userService;
        _logger = logger;
    }
    public async Task<IActionResult> OnGetAsync(string returnUrl = "/")
    {
        var result = await HttpContext.AuthenticateAsync("ExternalCookie");
        if (!result.Succeeded)
        {
            _logger.LogWarning("External login failed: {Error}",
                result.Failure?.Message);
            return RedirectToPage("/login",
                new { error = "External login failed." });
        }
        var email = result.Principal?.FindFirstValue(ClaimTypes.Email);
        var name = result.Principal?.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrEmpty(email))
            return RedirectToPage("/login",
                new { error = "Could not retrieve email from provider." });
        var (success, error, user) =
            await _userService.FindOrCreateExternalUserAsync(email, name);
        if (!success)
            return RedirectToPage("/login", new { error });
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user!.UserId),
            new(ClaimTypes.Email,          email),
            new(ClaimTypes.Name,           name ?? email)
        };
        var identity = new ClaimsIdentity(claims,
            CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme, principal);
        return LocalRedirect(returnUrl);
    }
}
//{
//    private readonly IUserService _userService;
//    private readonly ILogger<ExternalLoginCallbackModel> _logger;
//    public ExternalLoginCallbackModel(
//        IUserService userService,
//        ILogger<ExternalLoginCallbackModel> logger)
//    {
//        _userService = userService;
//        _logger = logger;
//    }
//    public async Task<IActionResult> OnGetAsync(string returnUrl = "/")
//    {
//        // Read what the external provider sent back
//        var result = await HttpContext.AuthenticateAsync(
//            "ExternalCookie"); // temp cookie from the challenge
//        if (!result.Succeeded)
//        {
//            _logger.LogWarning("External login failed: {Error}",
//                result.Failure?.Message);
//            return RedirectToPage("/login",
//                new { error = "External login failed." });
//        }
//        var externalUser = result.Principal;
//        var email = externalUser?.FindFirstValue(ClaimTypes.Email);
//        var name = externalUser?.FindFirstValue(ClaimTypes.Name);
//        if (string.IsNullOrEmpty(email))
//        {
//            return RedirectToPage("/login",
//                new { error = "Could not retrieve email from provider." });
//        }
//        // Find or create user in your system
//        var (success, error, user) =
//            await _userService.FindOrCreateExternalUserAsync(email, name);
//        if (!success)
//        {
//            return RedirectToPage("/login", new { error });
//        }
//        // Sign in with your app's cookie
//        var claims = new List<Claim>
//        {
//            new(ClaimTypes.NameIdentifier, user!.Id),
//            new(ClaimTypes.Email, email),
//            new(ClaimTypes.Name, name ?? email)
//        };
//        var identity = new ClaimsIdentity(claims,
//            CookieAuthenticationDefaults.AuthenticationScheme);
//        var principal = new ClaimsPrincipal(identity);
//        await HttpContext.SignInAsync(
//            CookieAuthenticationDefaults.AuthenticationScheme,
//            principal);
//        return LocalRedirect(returnUrl);
//    }

//}
