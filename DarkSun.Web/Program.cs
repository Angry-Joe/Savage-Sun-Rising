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

var builder = WebApplication.CreateBuilder(args);

// ==================== HOSTING CONFIG ====================
builder.WebHost.UseUrls("http://*:8080"); // Required for Docker / ECS

// ==================== BLAZOR + MUD BLAZOR ====================
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddMudServices(config =>
{
    config.SnackbarConfiguration.PositionClass = Defaults.Classes.Position.BottomRight;
    config.SnackbarConfiguration.PreventDuplicates = true;
});

// ==================== DARK SUN THEME ====================
var darkSunTheme = new MudTheme()
{
    PaletteLight = new PaletteLight
    {
        Primary = "#C44A2A",           // Burnt Orange
        Secondary = "#8A9B4E",         // Sickly Green
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
    // Support multiple common naming mistakes
    var accessKey = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID")
                 ?? Environment.GetEnvironmentVariable("AWS_KEY_ID")
                 ?? builder.Configuration["AWS:AccessKeyId"];

    var secretKey = Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY")
                 ?? builder.Configuration["AWS:SecretAccessKey"];

    if (string.IsNullOrEmpty(accessKey) || string.IsNullOrEmpty(secretKey))
    {
        Console.WriteLine("❌ AWS credentials not found in environment variables!");
        Console.WriteLine("   Expected: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY");
    }
    else
    {
        Console.WriteLine("✅ AWS Credentials loaded successfully (Account will be verified)");
    }

    var credentials = new Amazon.Runtime.BasicAWSCredentials(accessKey, secretKey);
    var config = new Amazon.DynamoDBv2.AmazonDynamoDBConfig
    {
        RegionEndpoint = Amazon.RegionEndpoint.USEast1
    };

    builder.Services.AddSingleton<IAmazonDynamoDB>(
        new Amazon.DynamoDBv2.AmazonDynamoDBClient(credentials, config));
}
else
{
    builder.Services.AddAWSService<IAmazonDynamoDB>();
}

builder.Services.AddScoped<IDynamoDBContext, DynamoDBContext>();

// ==================== SERVICES ====================
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICharacterService, CharacterService>();
builder.Services.AddScoped<ICharacterRepository, CharacterRepository>();
builder.Services.AddScoped<CharacterStateService>();
builder.Services.AddScoped<SpellSeederService>();

// ==================== AUTHENTICATION ====================
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/login";
        options.LogoutPath = "/logout";
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
    });

builder.Services.AddAuthorization();
builder.Services.AddCascadingAuthenticationState();
builder.Services.AddHttpContextAccessor();   // Required for UserService

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

// ==================== MIDDLEWARE PIPELINE ====================
//if (app.Environment.IsDevelopment())
//{
//    app.UseDeveloperExceptionPage();

//    // Safe Seeding
//    try
//    {
//        using var scope = app.Services.CreateScope();
//        var seeder = scope.ServiceProvider.GetRequiredService<SpellSeederService>();
//        await seeder.SeedAsync(forceOverwrite: false);
//        Console.WriteLine("✅ Development seeding completed");
//    }
//    catch (Exception ex)
//    {
//        Console.WriteLine($"⚠️ Seeding skipped: {ex.Message}");
//    }
//}

app.UseStaticFiles();
app.UseSession();                    // Must be before Authentication
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

app.MapRazorComponents<DarkSun.Web.Components.App>()
    .AddInteractiveServerRenderMode();

await app.RunAsync();