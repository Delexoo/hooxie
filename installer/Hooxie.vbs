Set fso = CreateObject("Scripting.FileSystemObject")
Set app = CreateObject("Wscript.Shell")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
app.CurrentDirectory = folder
app.Run "cmd /c """ & folder & "\Hooxie.cmd"" --run", 0, False
