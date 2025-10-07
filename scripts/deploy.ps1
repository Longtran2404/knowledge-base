# Nam Long Center - Auto Deploy Script (PowerShell)
# This script automates the deployment process on Windows

Write-Host "🚀 Starting Nam Long Center Deployment..." -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    exit 1
}

# Step 1: Install dependencies
Write-Status "Installing dependencies..."
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Step 2: Run linting
Write-Status "Running ESLint..."
npm run lint

if ($LASTEXITCODE -ne 0) {
    Write-Warning "ESLint found issues, but continuing..."
}

# Step 3: Build the project
Write-Status "Building project..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}

# Step 4: Check build output
if (-not (Test-Path "build")) {
    Write-Error "Build directory not found"
    exit 1
}

Write-Status "Build completed successfully!"

# Step 5: Display build info
Write-Host ""
Write-Host "📊 Build Information:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

$buildSize = (Get-ChildItem -Path "build" -Recurse | Measure-Object -Property Length -Sum).Sum
$buildSizeMB = [math]::Round($buildSize / 1MB, 2)
Write-Host "Build directory size: $buildSizeMB MB"

# Step 6: Check for environment variables
Write-Host ""
Write-Host "🔧 Environment Check:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

if (Test-Path ".env") {
    Write-Status "Environment file found"
} else {
    Write-Warning "No .env file found. Please create one from .env.example"
}

# Step 7: Deployment instructions
Write-Host ""
Write-Host "🚀 Deployment Instructions:" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host "1. Upload the 'build' folder to your hosting provider"
Write-Host "2. Configure environment variables on your hosting platform"
Write-Host "3. Set up your domain and SSL certificate"
Write-Host "4. Test the application thoroughly"

# Step 8: Vercel deployment (if vercel CLI is available)
if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Write-Host ""
    Write-Host "🌐 Vercel CLI detected. Would you like to deploy to Vercel? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Status "Deploying to Vercel..."
        vercel --prod
    }
} else {
    Write-Warning "Vercel CLI not found. Install it with: npm i -g vercel"
}

Write-Host ""
Write-Status "Deployment script completed!"
Write-Host "Build is ready in the 'build' directory."
