' GPT-Schach beenden: stoppt den lokalen Server auf Port 80 (bzw. 8080).
CreateObject("WScript.Shell").Run "powershell -NoProfile -Command ""Get-NetTCPConnection -LocalPort 80,8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; if ($p.ProcessName -eq 'node') { Stop-Process -Id $p.Id -Force } }""", 0, True
