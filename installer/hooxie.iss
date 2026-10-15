#define MyAppName "Hooxie"
#define MyAppVersion "0.2.0"
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
LicenseFile=..\LICENSE
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
VersionInfoVersion=0.2.0.0
VersionInfoCopyright=Copyright (C) 2026 Delexo
SetupLogging=yes
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Shortcuts:"; Flags: unchecked
Name: "startonlogon"; Description: "Start Hooxie when I sign in to Windows"; GroupDescription: "Shortcuts:"; Flags: unchecked

[Files]
Source: "..\dist-setup\stage\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Hooxie"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\shell\HooxieShell.exe"; Comment: "Hooxie overlay by Delexo"
Name: "{group}\Hooxie website"; Filename: "{#MyAppURL}"
Name: "{group}\Uninstall Hooxie"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Hooxie"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\shell\HooxieShell.exe"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "Hooxie"; ValueData: """{app}\{#MyAppExeName}"""; Flags: uninsdeletevalue; Tasks: startonlogon

[Run]
Filename: "{cmd}"; Parameters: "/c set ""PATH={autopf}\nodejs;{localappdata}\Programs\nodejs;%PATH%"" && npm install"; WorkingDir: "{app}"; StatusMsg: "Installing Hooxie packages..."; Flags: runhidden waituntilterminated skipifsilent
Filename: "{app}\{#MyAppExeName}"; Description: "Launch Hooxie"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\node_modules"

[Code]
function NodeOnPath: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('where.exe', 'node', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
  if not Result then
    Result := FileExists(ExpandConstant('{autopf}\nodejs\node.exe')) or FileExists(ExpandConstant('{localappdata}\Programs\nodejs\node.exe'));
end;

function InitializeSetup(): Boolean;
var
  Dummy: Integer;
begin
  Result := True;
  if not NodeOnPath then
  begin
    MsgBox('Hooxie needs Node.js 22.13 or newer.'#13#10#13#10'Install Node LTS from https://nodejs.org, then run this installer again.'#13#10'Hooxie: https://hooxie.com', mbError, MB_OK);
    ShellExec('open', 'https://nodejs.org', '', '', SW_SHOWNORMAL, ewNoWait, Dummy);
    Result := False;
  end;
end;
