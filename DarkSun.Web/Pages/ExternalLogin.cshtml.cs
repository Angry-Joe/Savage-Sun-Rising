using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace DarkSun.Web.Pages;

public class ExternalLoginModel : PageModel
{
    public IActionResult OnGet(string provider, string returnUrl = "/")
    {
        var redirectUrl = Url.Page("/ExternalLoginCallback", values: new { returnUrl });
        var properties  = new AuthenticationProperties { RedirectUri = redirectUrl };
        properties.Items["LoginProvider"] = provider;
        return Challenge(properties, provider);
    }
}
