using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using DarkSun.Application.Interfaces;
using DarkSun.Application.Services;
using DarkSun.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddDarkSunInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // DynamoDB
        services.AddDefaultAWSOptions(config.GetAWSOptions());
        services.AddAWSService<IAmazonDynamoDB>();
        services.AddScoped<IDynamoDBContext, DynamoDBContext>();

        // Repositories
        services.AddScoped<ICharacterRepository, CharacterRepository>();
        services.AddScoped<ICharacterService, CharacterService>();

        return services;
    }
}