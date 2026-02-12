# Upload len GitHub + Vercel
Set-Location $PSScriptRoot\..

# 1. Kiem tra dang nhap GitHub
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[1] Dang nhap GitHub - mo trinh duyet va nhap ma khi duoc hoi:" -ForegroundColor Yellow
    gh auth login --web --git-protocol https
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

# 2. Tao repo (neu chua co) va push
Write-Host "`n[2] Tao repo 'knowledge-base' va push code..." -ForegroundColor Cyan
gh repo create knowledge-base --public --source=. --remote=origin --push 2>$null
if ($LASTEXITCODE -ne 0) {
    git push -u origin main
}
if ($LASTEXITCODE -eq 0) { Write-Host "   GitHub: xong.`n" -ForegroundColor Green }

# 3. Vercel
Write-Host "[3] Deploy Vercel..." -ForegroundColor Cyan
npx vercel --prod --yes 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "   Vercel: chay 'vercel login' roi 'vercel --prod' trong terminal.`n" -ForegroundColor Yellow }
else { Write-Host "   Vercel: xong.`n" -ForegroundColor Green }
