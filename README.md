# Hooxie

**Hooxie** by **Delexo** · [hooxie.com](https://hooxie.com)

Hooxie is an always-on-top Windows overlay that sends a prompt, files, and optionally the screen to a Cursor agent. It stays on your display. With Detectable off, a normal screen share does not see it.

Use is governed by the [Hooxie License Agreement](LICENSE). When a public showing is allowed, credit Delexo: tag **@delexo** or link [hooxie.com](https://hooxie.com). Source: [github.com/Delexoo/hooxie](https://github.com/Delexoo/hooxie).

## Requirements

- Windows 10 or 11
- The Windows installer includes Node.js. A source checkout needs [Node.js](https://nodejs.org) 22.13 or newer
- The [Cursor](https://cursor.com/download) desktop app, signed in, with an available Cursor plan

## Install

### Windows installer

Build the Inno Setup package:

```powershell
npm install
powershell -File scripts/package-windows.ps1
```

The installer is written to `dist-setup/Hooxie-Setup-0.2.12.exe`. It installs Hooxie under `Program Files\Delexo\Hooxie`, shows the license, and can add a Start Menu shortcut, a desktop shortcut, and a sign-in startup entry. The current download is on the [0.2.12 release](https://github.com/Delexoo/hooxie/releases/download/v0.2.12/Hooxie-Setup-0.2.12.exe) and at [hooxie.com/download/Hooxie-Setup.exe](https://hooxie.com/download/Hooxie-Setup.exe). The setup includes the newest Node.js 22 available when that setup was built, and the Hooxie packages, inside the Hooxie folder. It does not change a Node.js already installed on the computer. Uninstall removes Hooxie's copy with the app. If the WebView2 runtime is missing, setup downloads it. The desktop shell is included, so a separate .NET install is not.

### From source

```bash
npm install
npm start
```

The overlay opens at the top of the screen. The local page is `http://127.0.0.1:47321`. The marketing site is `/home`.

## What it does

- Keeps the prompt on the bar. Upload sits on the left. Send or voice sits on the right.
- Opens the screen switch, project path, attachments, and conversation when you are typing, listening, or the agent is working
- Grows the prompt and moves the other controls under it when a line runs out of room
- Says “Hooxie” once to start voice. The outline opens and closes with its own sounds
- Hold Escape for 0.75 seconds to clear the prompt. The outline color closes around the border
- More options can open the connected IDE on the current project, Recenter the pill at the top of the screen, or turn on Advanced mode for Files, Changes, Terminal, Details, and Look
- Preset prompts can be used, viewed, edited, or deleted from a slim list
- `Ctrl+\` slides the pill off the nearest edge and fades it out. Pressing it again brings the pill back
- Hide from standard capture with Detectable off (`Ctrl+Shift+\`)
- The dashboard opens inside Hooxie. It is a gray window with a white panel, icon rows, blue switches, and outlined controls. Settings covers appearance, audio, and sounds. Connections is one dropdown for more than thirty services, including GitHub, Supabase, Vercel, and Resend. Connect opens that service’s key page in the browser when one exists, or you paste an API key. You can connect more than one. Advanced stores a negative prompt and memory presets. Toggle Hooxie and Quit Hooxie stay at the bottom of the sidebar
- Hooxie is $5.99 once for this computer. It does not replace a Cursor plan. A license from another computer does not unlock this one

## Release notes

Notes for each version are in [brain/log.json](brain/log.json). Each version lists what was added and what was fixed. `npm run notes` refreshes the website from that file. `node scripts/post-release-notes.mjs` publishes any version that is not already a [GitHub release](https://github.com/Delexoo/hooxie/releases).

## License

[Hooxie License Agreement](LICENSE). One paid license is for one computer. The software is provided as is, and liability is limited as that agreement states. The copy on the site is [hooxie.com/license](https://hooxie.com/license).

## Company

Delexo  
Product: Hooxie  
https://hooxie.com  
support@delexo.store
