using System.Security.Claims;
using Amazon.DynamoDBv2.DataModel;
using DarkSun.Domain.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace DarkSun.Web.Pages;

public class ExternalLoginCallbackModel : PageModel
{
    private readonly IDynamoDBContext _db;

    public ExternalLoginCallbackModel(IDynamoDBContext db)
    {
        _db = db;
    }

    public async Task<IActionResult> OnGetAsync(string returnUrl = "/")
    {
        // Read the external login info
        var result = await HttpContext.AuthenticateAsync("External");
        if (!result.Succeeded)
            return RedirectToPage("/Login", new { error = "External login failed." });

        var externalClaims = result.Principal!.Claims.ToList();
        var provider         = result.Properties?.Items["LoginProvider"] ?? "Unknown";
        var providerSubject  = externalClaims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value ?? Guid.NewGuid().ToString();
        var email            = externalClaims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? string.Empty;
        var fullName         = externalClaims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? string.Empty;

        // Look up or create the user
        var user = await FindUserByEmailAsync(email);
        if (user == null)
        {
            user = new DarkSunUser
            {
                UserId           = Guid.NewGuid().ToString(),
                Email            = email,
                FullName         = fullName,
                Provider         = provider,
                ProviderSubjectId = providerSubject,
                CreatedAt        = DateTime.UtcNow,
                LastLoginAt      = DateTime.UtcNow
            };
            await _db.SaveAsync(user);
        }
        else
        {
            user.LastLoginAt = DateTime.UtcNow;
            await _db.SaveAsync(user);
        }

        // Sign in with a cookie containing the app's UserId
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId),
            new(ClaimTypes.Email,          user.Email),
            new(ClaimTypes.Name,           user.FullName)
        };

        var identity  = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        return LocalRedirect(returnUrl);
    }

    private async Task<DarkSunUser?> FindUserByEmailAsync(string email)
    {
        var search = _db.ScanAsync<DarkSunUser>(new[]
        {
            new ScanCondition("Email", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, email)
        });
        var results = await search.GetRemainingAsync();
        return results.FirstOrDefault();
    }
}
