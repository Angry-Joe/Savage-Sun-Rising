# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files (for layer caching)
COPY ["Savage-Sun-Rising.slnx", "."]
COPY ["DarkSun.Application/DarkSun.Application.csproj", "DarkSun.Application/"]
COPY ["DarkSun.Domain/DarkSun.Domain.csproj", "DarkSun.Domain/"]
COPY ["DarkSun.Infrastructure/DarkSun.Infrastructure.csproj", "DarkSun.Infrastructure/"]
COPY ["DarkSun.Web/DarkSun.Web.csproj", "DarkSun.Web/"]

# Restore
RUN dotnet restore "DarkSun.Web/DarkSun.Web.csproj"

# Copy remaining source
COPY . .

# Publish
RUN dotnet publish "DarkSun.Web/DarkSun.Web.csproj" -c Release -o /app/publish --no-restore /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "DarkSun.Web.dll"]