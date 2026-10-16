#define MyAppName "Hooxie"
#define MyAppVersion "0.2.12"
#define MyAppPublisher "Delexo"
#define MyAppURL "https://hooxie.com"
#define MyAppExeName "Hooxie.cmd"

[Setup]
AppId={{8F3A1C2E-9D44-4B7A-B6E1-2C8F0A91D5E3}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
AppCopyright=Copyright (C) 2026 Delexo
DefaultDirName={autopf}\Delexo\Hooxie
DefaultGroupName=Hooxie
DisableProgramGroupPage=yes
LicenseFile=license.rtf
SetupIconFile=..\src\widget-shell\hooxie.ico
UninstallDisplayIcon={app}\shell\HooxieShell.exe
PrivilegesRequired=admin
UsedUserAreasWarning=no
OutputDir=..\dist-setup
OutputBaseFilename=Hooxie-Setup-{#MyAppVersion}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayName=Hooxie
VersionInfoCompany=Delexo
VersionInfoProductName=Hooxie
VersionInfoVersion=0.2.12.0
VersionInfoCopyright=Copyright (C) 2026 Delexo
SetupLogging=yes
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Shortcuts:"; Flags: unchecked
Name: "startonlogon"; Description: "Start Hooxie when I sign in to Windows"; GroupDescription: "Shortcuts:"; Flags: unchecked

#ifndef Payload
#define Payload "stage"
#endif

[Files]
Source: "..\dist-setup\{#Payload}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Hooxie"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\Hooxie.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\shell\HooxieShell.exe"; Comment: "Hooxie overlay by Delexo"
Name: "{group}\Hooxie website"; Filename: "{#MyAppURL}"
Name: "{group}\Uninstall Hooxie"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Hooxie"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\Hooxie.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\shell\HooxieShell.exe"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "Hooxie"; ValueData: """{sys}\wscript.exe"" ""{app}\Hooxie.vbs"""; Flags: uninsdeletevalue; Tasks: startonlogon

[Run]
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\install-deps.ps1"""; WorkingDir: "{app}"; StatusMsg: "Checking the WebView2 runtime..."; Flags: runhidden waituntilterminated
Filename: "{sys}\wscript.exe"; Parameters: """{app}\Hooxie.vbs"""; Description: "Launch Hooxie"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\node_modules"
