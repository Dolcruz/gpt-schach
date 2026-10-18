# Creates a desktop and Start menu shortcut "GPT-Schach" on Windows.
# Aufruf: npm run shortcut
$root = Split-Path -Parent $PSScriptRoot
$ws = New-Object -ComObject WScript.Shell
$targets = @(
  (Join-Path ([Environment]::GetFolderPath('Desktop')) 'GPT-Schach.lnk'),
  (Join-Path ([Environment]::GetFolderPath('Programs')) 'GPT-Schach.lnk')
)
foreach ($t in $targets) {
  $s = $ws.CreateShortcut($t)
  $s.TargetPath = "$env:WINDIR\System32\wscript.exe"
  $s.Arguments = "`"$root\start.vbs`""
  $s.WorkingDirectory = $root
  $s.IconLocation = "$root\assets\gpt-schach.ico,0"
  $s.Description = 'GPT-Schach - Schach gegen Bots mit KI-Coach'
  $s.Save()
  Write-Host "Shortcut created: $t"
}
Write-Host 'Done. Double-click "GPT-Schach" to start the app at http://gpt-schach.localhost'
