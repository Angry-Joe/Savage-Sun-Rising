// DarkSun.Web/Program.cs
using Amazon.DynamoDBv2.DataModel;
using DarkSun.Application.Interfaces;
using DarkSun.Application.Services;
using DarkSun.Infrastructure.Persistence.Repositories;
using DarkSun.Infrastructure.Persistence.Seeders;
using MudBlazor;
using MudBlazor.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
//using DarkSun.Application.State;

var builder = WebApplication.CreateBuilder(args);

// Blazor + MudBlazor
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();
//builder.Services.AddRazorPages();
// My attempt at preventing these pages from being accessed directly
builder.Services.AddRazorPages(options =>
{
    options.Conventions.AddPageRoute("/EmailLogin", "/disabled-email-login"); // rename it
    options.Conventions.AddPageRoute("/ExternalLogin", "/disabled-external-login");
});

builder.Services.AddMudServices(config =>
{
    config.SnackbarConfiguration.PositionClass = Defaults.Classes.Position.BottomRight;
});

// AWS DynamoDB
builder.Services.AddAWSService<Amazon.DynamoDBv2.IAmazonDynamoDB>();
builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
builder.Services.AddScoped<IDynamoDBContext, DynamoDBContext>();

// Authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
    {
        options.LoginPath = "/login";
    })
    .AddCookie("External", options =>
    {
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    })
    .AddGoogle(options =>
    {
        options.SignInScheme  = "External";
        options.ClientId     = builder.Configuration["Authentication:Google:ClientId"]!;
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
    })
    .AddMicrosoftAccount(options =>
    {
        options.SignInScheme  = "External";
        options.ClientId     = builder.Configuration["Authentication:Microsoft:ClientId"]!;
        options.ClientSecret = builder.Configuration["Authentication:Microsoft:ClientSecret"]!;
    });

builder.Services.AddAuthorization();
builder.Services.AddCascadingAuthenticationState();
builder.Services.AddHttpContextAccessor();

// Stuff I built
builder.Services.AddScoped<ISpellRepository, DynamoSpellRepository>();
builder.Services.AddScoped<SpellSeederService>();
builder.Services.AddDarkSunInfrastructure(builder.Configuration);
builder.Services.AddScoped<ICharacterService, CharacterService>();
builder.Services.AddScoped<ICharacterRepository, CharacterRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
// New DarkSun.Applications.State folder for services that manage state across components
builder.Services.AddScoped<CharacterStateService>();

// This makes the HTTP context available via dependency injection
builder.Services.AddHttpContextAccessor();

// This enables session state
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// IMPORTANT: Add this line to enable session middleware
app.UseSession();

// Seed data in Development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<SpellSeederService>();
    await seeder.SeedAsync(forceOverwrite: false);
}

app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();
app.MapRazorPages();
app.MapRazorComponents<DarkSun.Web.Components.App>()
    .AddInteractiveServerRenderMode();

await app.RunAsync();