# Deployment script for DoctorAibolit backend

Write-Host "Building .NET project..." -ForegroundColor Green
Set-Location ..\backend
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "Restore failed!" -ForegroundColor Red
    exit 1
}

dotnet publish --configuration Release --output bin/Release/net10.0
if ($LASTEXITCODE -ne 0) {
    Write-Host "Publish failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nDeploying to AWS..." -ForegroundColor Green
Set-Location ..\infrastructure
serverless deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeployment successful!" -ForegroundColor Green
    Write-Host "`nNote the API Gateway URL from the output above." -ForegroundColor Yellow
} else {
    Write-Host "`nDeployment failed!" -ForegroundColor Red
    exit 1
}

