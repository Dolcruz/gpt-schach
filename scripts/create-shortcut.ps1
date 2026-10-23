# Creates a desktop and Start menu shortcut "GPT Chess" on Windows.
# Aufruf: npm run shortcut
$root = Split-Path -Parent $PSScriptRoot
$ws = New-Object -ComObject WScript.Shell
$targets = @(
  (Join-Path ([Environment]::GetFolderPath('Desktop')) 'GPT Chess.lnk'),
  (Join-Path ([Environment]::GetFolderPath('Programs')) 'GPT Chess.lnk')
)
foreach ($t in $targets) {
  $s = $ws.CreateShortcut($t)
  $s.TargetPath = "$env:WINDIR\System32\wscript.exe"
  $s.Arguments = "`"$root\start.vbs`""
  $s.WorkingDirectory = $root
  $s.IconLocation = "$root\assets\gpt-chess.ico,0"
  $s.Description = 'GPT Chess - chess vs bots with an AI coach'
  $s.Save()
  Write-Host "Shortcut created: $t"
}
Write-Host 'Done. Double-click "GPT Chess" to start the app at http://gpt-chess.localhost'
