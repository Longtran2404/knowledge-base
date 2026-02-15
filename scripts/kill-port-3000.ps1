# Kill process using port 3000 (Windows) - compatible with older PowerShell
$port = 3000
$line = & cmd /c "netstat -ano | findstr :$port"
if ($line) {
  $pids = $line | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
  foreach ($p in $pids) {
    if ($p -match '^\d+$') {
      & taskkill /F /PID $p 2>$null
      Write-Host "Stopped process $p on port $port"
    }
  }
} else {
  Write-Host "No process found on port $port"
}
