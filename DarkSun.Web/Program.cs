// DarkSun.Web/Program.cs
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using DarkSun.Application.Interfaces;
using DarkSun.Application.Services;
using DarkSun.Infrastructure.Persistence.Repositories;
using DarkSun.Infrastructure.Persistence.Seeders;
using Microsoft.AspNetCore.Authentication.Cookies;
using MudBlazor;
using MudBlazor.Services;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

// ==================== AUTHENTICATION (MUST BE FIRST) ====================
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
    {
        options.LoginPath = "/login";
        options.LogoutPath = "/logout";
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
    })
    .AddCookie("ExternalCookie")
    .AddMicrosoftAccount(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Microsoft:ClientId"]!;
        options.ClientSecret = builder.Configuration["Authentication:Microsoft:ClientSecret"]!;
        options.SignInScheme = "ExternalCookie";
    })
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
        options.SignInScheme = "ExternalCookie";
    });

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

// ==================== SERVICES ====================
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICharacterService, CharacterService>();
builder.Services.AddScoped<ICharacterRepository, CharacterRepository>();
builder.Services.AddScoped<CharacterStateService>();
builder.Services.AddScoped<SpellSeederService>();

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

// ==================== AWS + DYNAMODB ====================
if (builder.Environment.IsDevelopment())
{
    var creds = AwsCredentials.ParseFromFile()
        ?? AwsCredentials.ParseFromEnvironment()
        ?? throw new InvalidOperationException("❌ AWS credentials not found!");

    builder.Services.AddSingleton<IAmazonDynamoDB>(new AmazonDynamoDBClient(
        new Amazon.Runtime.BasicAWSCredentials(creds.AccessKeyId, creds.SecretAccessKey),
        new AmazonDynamoDBConfig { RegionEndpoint = Amazon.RegionEndpoint.USEast1 }));
}
else
{
    builder.Services.AddAWSService<IAmazonDynamoDB>();
}

builder.Services.AddScoped<IDynamoDBContext, DynamoDBContext>();

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

// ==================== SEEDING ====================
try
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<SpellSeederService>();
    await seeder.SeedAsync(forceOverwrite: false);
    Console.WriteLine("✅ Development seeding completed");
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️ Seeding skipped: {ex.Message}");
}

// ==================== MIDDLEWARE ====================
app.UseStaticFiles();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

app.MapRazorComponents<DarkSun.Web.Components.App>()
    .AddInteractiveServerRenderMode();

await app.RunAsync();

// ==================== AWS CREDENTIAL HELPER ====================
internal record AwsCredentials(string AccessKeyId, string SecretAccessKey)
{
    public void Deconstruct(out string accessKeyId, out string secretAccessKey)
    {
        accessKeyId = AccessKeyId;
        secretAccessKey = SecretAccessKey;
    }

    public static AwsCredentials? ParseFromFile()
    {
        var filePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".aws", "credentials");
        if (!File.Exists(filePath)) return null;

        var content = File.ReadAllText(filePath);
        var keyMatch = Regex.Match(content, @"aws_access_key_id\s*=\s*(?<v>[A-Za-z0-9]+)", RegexOptions.IgnoreCase);
        var secretMatch = Regex.Match(content, @"aws_secret_access_key\s*=\s*(?<v>.+)$", RegexOptions.IgnoreCase | RegexOptions.Multiline);

        return (keyMatch.Success && secretMatch.Success)
            ? new AwsCredentials(keyMatch.Groups["v"].Value.Trim(), secretMatch.Groups["v"].Value.Trim())
            : null;
    }

    public static AwsCredentials? ParseFromEnvironment()
    {
        var key = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID") ?? Environment.GetEnvironmentVariable("AWS_KEY_ID");
        var secret = Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY");
        return (key, secret) is (not null, not null) ? new AwsCredentials(key, secret) : null;
    }
}