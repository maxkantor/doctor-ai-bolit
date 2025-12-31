# Deployment script for DoctorAibolit backend using AWS SAM

Write-Host "Checking prerequisites..." -ForegroundColor Green

# Check if SAM CLI is installed
$samVersion = sam --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "AWS SAM CLI is not installed!" -ForegroundColor Red
    Write-Host "Please install it from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html" -ForegroundColor Yellow
    exit 1
}

Write-Host "Building and packaging with SAM..." -ForegroundColor Green
Set-Location $PSScriptRoot

sam build --template template.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "SAM build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nDeploying to AWS..." -ForegroundColor Green
sam deploy --guided
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeployment successful!" -ForegroundColor Green
    Write-Host "`nNote the API Gateway URL from the output above." -ForegroundColor Yellow
    Write-Host "You'll need this URL for your frontend .env file (VITE_API_URL)." -ForegroundColor Yellow
} else {
    Write-Host "`nDeployment failed!" -ForegroundColor Red
    exit 1
}

