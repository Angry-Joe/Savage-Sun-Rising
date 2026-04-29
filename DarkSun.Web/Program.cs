// DarkSun.Web/Program.cs
using Amazon.DynamoDBv2.DataModel;
using DarkSun.Application.Interfaces;
using DarkSun.Infrastructure.Persistence.Repositories;
using DarkSun.Infrastructure.Persistence.Seeders;
using MudBlazor;
using MudBlazor.Services;

var builder = WebApplication.CreateBuilder(args);

// Blazor + MudBlazor
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddMudServices(config =>
{
    config.SnackbarConfiguration.PositionClass = Defaults.Classes.Position.BottomRight;
});

// AWS DynamoDB
builder.Services.AddAWSService<Amazon.DynamoDBv2.IAmazonDynamoDB>();
builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());

builder.Services.AddScoped<IDynamoDBContext, DynamoDBContext>();

// Our services
builder.Services.AddScoped<ISpellRepository, DynamoSpellRepository>();
builder.Services.AddScoped<SpellSeederService>();

var app = builder.Build();

// Seed data in Development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<SpellSeederService>();
    await seeder.SeedAsync(forceOverwrite: false);
}

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<DarkSun.Web.Components.App>()
    .AddInteractiveServerRenderMode();

app.Run();