' GPT-Schach unsichtbar starten (Windows-Verknuepfung): baut bei Bedarf neu,
' startet den Server auf Port 80 und oeffnet http://gpt-schach.localhost
Option Explicit
Dim fso, sh, root
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
root = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = root
If Not fso.FolderExists(root & "\data") Then fso.CreateFolder(root & "\data")
sh.Environment("Process")("PORT") = "80"
sh.Run "cmd /c node launch.mjs > """ & root & "\data\launcher.log"" 2>&1", 0, False
