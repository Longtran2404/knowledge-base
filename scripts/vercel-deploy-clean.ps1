# Vercel: Xóa project cũ và deploy mới
# Cần thêm VERCEL_TOKEN vào .env (https://vercel.com/account/tokens)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

# Đọc VERCEL_TOKEN từ .env
$token = $env:VERCEL_TOKEN
$envPath = Join-Path $root ".env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*VERCEL_TOKEN\s*=\s*(.+)$') {
            $t = $Matches[1].Trim()
            if ($t -and $t -ne '') { $token = $t }
        }
    }
}

if (-not $token) {
    Write-Host ""
    Write-Host "CHUA CAU HINH VERCEL_TOKEN!" -ForegroundColor Red
    Write-Host "1. Vao https://vercel.com/account/tokens"
    Write-Host "2. Tao token moi"
    Write-Host "3. Mo file .env va them dong: VERCEL_TOKEN=<token_cua_ban>" -ForegroundColor Yellow
    Write-Host "   (bo dau # va thay <token_cua_ban> bang token that)" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

$tokenArgs = @("--token", $token)

Write-Host "Dang xoa project cu..." -ForegroundColor Cyan
$projects = @("knowledge-base-bpxt", "knowledge-base")
foreach ($proj in $projects) {
    Write-Host "  Xoa $proj..."
    & npx vercel project rm $proj --yes @tokenArgs 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Host "    -> Da xoa $proj" -ForegroundColor Green }
    else { Write-Host "    -> (Bo qua - co the da xoa)" -ForegroundColor Gray }
}

Write-Host ""
Write-Host "Dang deploy len Vercel..." -ForegroundColor Cyan
& npx vercel --prod --yes @tokenArgs
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deploy thanh cong!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Deploy that bai. Kiem tra lai VERCEL_TOKEN." -ForegroundColor Red
    exit 1
}
