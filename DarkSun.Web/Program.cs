// DarkSun.Web/Program.cs
// Local-development friendly version — no AWS / DynamoDB required.
using DarkSun.Application.Interfaces;
using DarkSun.Application.Services;
using DarkSun.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Authentication.Cookies;
using MudBlazor;
using MudBlazor.Services;

var builder = WebApplication.CreateBuilder(args);

// ==================== AUTHENTICATION ====================
// Cookie auth is always available. External providers are optional so the app
// starts cleanly even when ClientId/Secret secrets are not configured.
var authBuilder = builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
    {
        options.LoginPath = "/login";
        options.LogoutPath = "/logout";
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
    })
    .AddCookie("ExternalCookie");

var msClientId = builder.Configuration["Authentication:Microsoft:ClientId"];
var msClientSecret = builder.Configuration["Authentication:Microsoft:ClientSecret"];
if (!string.IsNullOrWhiteSpace(msClientId) && !string.IsNullOrWhiteSpace(msClientSecret))
{
    authBuilder.AddMicrosoftAccount(options =>
    {
        options.ClientId = msClientId;
        options.ClientSecret = msClientSecret;
        options.SignInScheme = "ExternalCookie";
    });
    Console.WriteLine("✅ Microsoft external login configured");
}
else
{
    Console.WriteLine("ℹ️  Microsoft external login skipped (no ClientId/Secret)");
}

var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (!string.IsNullOrWhiteSpace(googleClientId) && !string.IsNullOrWhiteSpace(googleClientSecret))
{
    authBuilder.AddGoogle(options =>
    {
        options.ClientId = googleClientId;
        options.ClientSecret = googleClientSecret;
        options.SignInScheme = "ExternalCookie";
    });
    Console.WriteLine("✅ Google external login configured");
}
else
{
    Console.WriteLine("ℹ️  Google external login skipped (no ClientId/Secret)");
}

builder.Services.AddAuthorization();
builder.Services.AddCascadingAuthenticationState();
builder.Services.AddHttpContextAccessor();

// ==================== HOSTING ====================
if (!builder.Environment.IsDevelopment())
    builder.WebHost.UseUrls("http://*:8080");

// ==================== BLAZOR + MUD ====================
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddMudServices(config =>
{
    config.SnackbarConfiguration.PositionClass = Defaults.Classes.Position.BottomRight;
    config.SnackbarConfiguration.PreventDuplicates = true;
});

// ==================== LOCAL / OFFLINE SERVICES ====================
// These replace the previous DynamoDB-backed repositories so the site
// runs fully offline during the migration to PostgreSQL.
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, LocalUserRepository>();
builder.Services.AddScoped<ICharacterService, CharacterService>();
builder.Services.AddScoped<ICharacterRepository, LocalCharacterRepository>();
builder.Services.AddScoped<ISpellRepository, LocalSpellRepository>();
builder.Services.AddScoped<CharacterStateService>();

// ==================== DARK SUN THEME ====================
var darkSunTheme = new MudTheme()
{
    PaletteLight = new PaletteLight
    {
        Primary = "#C44A2A",
        Secondary = "#8A9B4E",
        Background = "#1C140F",
        Surface = "#2A211B",
        TextPrimary = "#E8D5A3",
        TextSecondary = "#E5D9C0",
        AppbarBackground = "#9B2A1F",
        DrawerBackground = "#1F1814",
        Divider = "#4A3A2F"
    }
};
builder.Services.AddSingleton(darkSunTheme);

// ==================== SESSION ====================
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// ==================== BUILD APP ====================
var app = builder.Build();

Console.WriteLine("🌅 Savage Sun Rising — local offline mode");
Console.WriteLine("   Spells loaded from wwwroot/data/*.json");
Console.WriteLine("   Users & characters stored in-memory (reset on restart)");

// ==================== MIDDLEWARE ====================
app.UseStaticFiles();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

app.MapRazorComponents<DarkSun.Web.Components.App>()
    .AddInteractiveServerRenderMode();

await app.RunAsync();
