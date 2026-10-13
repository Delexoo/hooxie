# Hooxie

**A Delexo product** · [@delexo](https://delexo.store) · [delexo.store](https://delexo.store)

Hooxie is an always-on-top Windows overlay that sends a prompt, files, and optionally the screen to a Cursor agent. It stays on your display. With Detectable off, a normal screen share does not see it.

Credit Delexo if you use, remix, or show this software. Tag **@delexo** or link [delexo.store](https://delexo.store) in the video, description, README, or listing. Source: [github.com/Delexoo/hooxie](https://github.com/Delexoo/hooxie). See [LICENSE](LICENSE).

## Requirements

- Windows 10 or 11
- [Node.js](https://nodejs.org) 22.13 or newer
- The [Cursor](https://cursor.com/download) desktop app, signed in, with an available Cursor plan

## Install

### Windows installer

Build the Inno Setup package:

```powershell
npm install
powershell -File scripts/package-windows.ps1
```

The installer is written to `dist/Hooxie-Setup-0.1.0.exe`. It installs under `Program Files\Delexo\Hooxie`, shows the license, and can add Start Menu and desktop shortcuts.

### From source

```bash
npm install
npm start
```

The overlay opens at the top of the screen. The local page is `http://127.0.0.1:47321`. The marketing site is `/home`.

## What it does

- Starts a **new Cursor agent session** on the folder shown on the pill
- Voice when the prompt is empty, send when there is text, stop while the agent works
- Attach files, a folder, or a screenshot
- Hide from standard capture with Detectable off (`Ctrl+Shift+\`)
- Show terminals, queued prompts, and modified files only when they exist
- Hooxie Pro is $4.99/month and does not replace a Cursor plan

## License

[Delexo Attribution License](LICENSE). Do what you want with the code. Give Delexo credit people can see.

## Company

Delexo  
https://delexo.store  
support@delexo.store
