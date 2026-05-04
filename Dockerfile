# Stage 1: Build Environment
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# --- Layer Caching Optimization ---
# 1. Copy all .csproj files from their respective project folders.
# This ensures that if any project's dependencies change, the restore layer is invalidated.
COPY ["DarkSun.Web/DarkSun.Web.csproj", "DarkSun.Web/"]
COPY ["DarkSun.Application/DarkSun.Application.csproj", "DarkSun.Application/"]
COPY ["DarkSun.Domain/DarkSun.Domain.csproj", "DarkSun.Domain/"]
COPY ["DarkSun.Infrastructure/DarkSun.Infrastructure.csproj", "DarkSun.Infrastructure/"]
# We don't need to copy the .Tests project for the final image.

# 2. Restore NuGet packages for the main web project.
# Dotnet restore will automatically find and restore the other referenced projects.
RUN dotnet restore "DarkSun.Web/DarkSun.Web.csproj"

# 3. Copy the rest of the source code for all projects.
COPY . .

# 4. Build and publish the application in Release configuration.
WORKDIR "/src/DarkSun.Web"
RUN dotnet publish "DarkSun.Web.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Final Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy the published output from the 'publish' stage
COPY --from=build /app/publish .

# Expose the port the app will run on.
EXPOSE 8081
# Set the URL for the app to listen on. Defaults to Production environment.
ENV ASPNETCORE_URLS=http://+:8080

# --- Secure Credential Handling ---
# Your AWS credentials should be passed in at runtime, NOT included in the image.
# Example for local Docker run with volume mounting:
#   docker run -it -p 8081:8080 ^
#     -e "ASPNETCORE_ENVIRONMENT=Development" ^
#     -v "%USERPROFILE%/.aws:/root/.aws:ro" ^
#     darksun-web:latest

# Define the entry point for the container.
ENTRYPOINT ["dotnet", "DarkSun.Web.dll"]
