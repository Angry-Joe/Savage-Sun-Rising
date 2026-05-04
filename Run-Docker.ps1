# C:\jdlcode\repos\Savage-Sun-Rising\run-docker.ps1
<#
docker run -it -p 8081:8080 --rm `
    -e "ASPNETCORE_ENVIRONMENT=Development" `
    -v "$env:USERPROFILE\.aws:/root/.aws:ro" `
    darksun-web-1:latest
#>
    # This script builds and runs the Docker container for the DarkSun.Web application.
# It should be run from the root of the repository.

# --- Configuration ---
$imageName = "darksun-web"
$hostPort = 8081
$containerPort = 8080

# --- Build the Docker image ---
Write-Host "Building Docker image: $imageName..."
docker build -t $imageName .

# Check if the build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed. Please check the output above."
    exit
}

Write-Host "Build successful."
Write-Host "Running container. Access the application at http://localhost:$hostPort"

# --- Run the Docker container ---
# Pass secrets and configurations as environment variables.
# Mount the local AWS credentials file as a read-only volume.
docker run -it -p "${hostPort}:${containerPort}" --rm `
    -e "ASPNETCORE_ENVIRONMENT=Development" `
    -v "$env:USERPROFILE\.aws:/root/.aws:ro" `
    $imageName
