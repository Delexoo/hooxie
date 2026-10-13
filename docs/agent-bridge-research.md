# Agent bridge research

Checked against current vendor documentation and issue trackers in October 2026. A capability is listed as supported only when an official contract can submit a prompt, name the project, and report what happened. Internal commands and clipboard copies are not treated as agent acceptance.

## Cursor

Official path: the [Cursor TypeScript SDK](https://cursor.com/docs/sdk/typescript) (`@cursor/sdk`, public beta). `Agent.create` plus `agent.send` submits a prompt to a local agent bound to `local.cwd`, or to a cloud agent. The same docs cover images on `send`, `run.status`, `run.wait()`, `run.cancel()`, and `result.result`. Local runs can edit files and execute commands. There is no IDE approval dialog on that path. Cloud runs can show up in Cursor's Agents window; this build uses the local runtime so the selected folder is the workspace.

The [extension API](https://cursor.com/docs/extension-api) registers MCP servers and plugin paths. It does not submit chat prompts.

Cursor staff, on the forum, said `workbench.action.chat.open` fills the prompt and does not auto-send. `composer.startGeneration` was described as unofficial. Z does not call it.

The SDK does not type into the Composer thread that is already open. The UI says that before sending.

## Visual Studio Code

The [Chat Participant API](https://code.visualstudio.com/api/extension-guides/chat) and `vscode.lm` let an extension handle chat or call a language model. That is a side request. It is not Copilot agent mode, so Z does not use it as delivery.

`workbench.action.chat.open` is an internal workbench command. In current VS Code source, `isPartialQuery: true` only fills the input, and `false` calls `acceptInput()`. A VS Code developer suggested the partial form for extensions. [Issue 318097](https://github.com/microsoft/vscode/issues/318097) asks for a stable public command because this one is not a guaranteed API. The companion extension uses it only when it exists, defaults to partial, and reports "awaiting user action". It never reports agent progress.

## Windsurf

[Cascade's documentation](https://docs.devin.ai/windsurf/plugins/cascade/cascade-overview) describes the product inside the IDE. It does not document an external submit API. Hooks such as `UserPromptSubmit` observe a prompt the user already sent. They do not submit one. Community write-ups of Cascade's private RPC are not a supported contract, and Z does not call them.

## JetBrains

JetBrains staff have said third-party plugins may not call AI Assistant or Junie APIs. The request is tracked as [YouTrack LLM-2340](https://youtrack.jetbrains.com/issue/LLM-2340/Allow-third-party-plugins-to-call-external-API-for-AI-Assistant). [ACP support](https://www.jetbrains.com/help/ai-assistant/acp.html) lets the IDE host an external agent. It does not let an outside app submit a prompt to Junie. Z uses the clipboard for JetBrains.

## Visual Studio

There is no documented extension API for submitting a GitHub Copilot Chat prompt. A [feature request](https://developercommunity.visualstudio.com/t/Allow-VS202226-IDE-Extensions-Access-to/11061427) asks for one. Z uses the clipboard.

## Zed

Zed can host agents through the Agent Client Protocol. That is the IDE calling an agent, not an outside app submitting into Zed's assistant. Z uses the clipboard.

## What Z does with that

| IDE | Submit a prompt | Project | Files | Images | Read the reply | See working / done | Cancel |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cursor SDK | Supported, official | `local.cwd` | Inlined text only | Supported | Supported | Supported | Supported |
| VS Code / Cursor chat via companion | Experimental place-in-input | Window must already be that folder | Inlined text only | No | No | No | No |
| Windsurf, JetBrains, Visual Studio, Zed | Clipboard fallback | You confirm the window | Inlined text only | No | No | No | No |

UI automation was not implemented. Sending keystrokes can land in the wrong window, and a paste is still not proof the agent accepted the prompt.
