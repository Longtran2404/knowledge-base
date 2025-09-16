# Script to deploy project to GitHub
# Run this script in PowerShell

Write-Host "Starting deployment of Nam Long Center to GitHub..." -ForegroundColor Green

# Check git status
Write-Host "Checking git status..." -ForegroundColor Yellow
git status

# Add all files
Write-Host "Adding files to git..." -ForegroundColor Yellow
git add .

# Commit with message
Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = "Comprehensive UI upgrade - Modern components, improved UX/UI, performance optimization and accessibility"
git commit -m $commitMessage

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "Deployment complete! Project updated on GitHub." -ForegroundColor Green
Write-Host "View at: https://github.com/LongTran2404/namlongcenter" -ForegroundColor Cyan

# Show statistics
Write-Host "`nImprovement statistics:" -ForegroundColor Magenta
Write-Host "  - Upgraded CSS with modern animations and gradients" -ForegroundColor White
Write-Host "  - Improved HomePage with hero section and features section" -ForegroundColor White
Write-Host "  - Added 15+ new UI components (Loading, Modal, Toast, Search, Carousel, etc.)" -ForegroundColor White
Write-Host "  - Optimized responsive design for all devices" -ForegroundColor White
Write-Host "  - Improved performance with lazy loading and virtual scrolling" -ForegroundColor White
Write-Host "  - Enhanced accessibility with ARIA support and keyboard navigation" -ForegroundColor White
Write-Host "  - Added dark mode and theme switching support" -ForegroundColor White
Write-Host "  - Added Error Boundary and notification system" -ForegroundColor White
Write-Host "  - Created comprehensive documentation for all components" -ForegroundColor White

Write-Host "`nNam Long Center project has been comprehensively upgraded!" -ForegroundColor Green
