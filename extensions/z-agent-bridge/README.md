# Z Agent Bridge

This extension is optional. Z still copies a prompt to the clipboard, and the Cursor SDK route does not need it.

The extension connects to Z on `127.0.0.1`, reads `%APPDATA%\Z\bridge.json`, and accepts a prompt only for a workspace folder that this window already has open. It then calls the internal command `workbench.action.chat.open`.

- By default `isPartialQuery` is true. The prompt is placed in the chat input. That is not agent acceptance.
- The experimental submit flag asks the IDE to submit. Z still cannot see whether the agent accepted, is working, or finished.
- If the command is missing, the extension reports failure and does not pretend the prompt was delivered.
- Messages that fail `protocol.js` are rejected.

`workbench.action.chat.open` is not a stable public extension API. VS Code developers have suggested it for pre-filling chat, and [vscode#318097](https://github.com/microsoft/vscode/issues/318097) asks for a supported replacement. Cursor staff have said the string form does not auto-send.

## Install

1. Start Z with `npm start` so it writes `bridge.json`.
2. In Cursor or VS Code, run **Developer: Install Extension from Location…** and choose this folder.
3. Reload the window. The extension keeps a connection open, so a prompt is picked up as soon as it is sent.

The bridge token is a file in your user profile, readable by your user. Z listens only on `127.0.0.1` and rejects malformed messages. Do not expose that port.

## What this extension does not do

It does not call Cursor Composer private commands, Windsurf's private Cascade RPC, or JetBrains AI Assistant internals. It does not report agent progress.
