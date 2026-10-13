import type { AgentCapabilities, IdeId, Stability } from "./types.ts";

export interface IdeProfile {
  ide: IdeId;
  label: string;
  summary: string;
  capabilities: AgentCapabilities;
  limitations: string[];
  unsupported: string[];
}

const none: AgentCapabilities = {
  programmaticSubmit: false,
  projectTargeting: false,
  textContext: true,
  nativeFileAttachments: false,
  images: false,
  readResponses: false,
  observeWorking: false,
  observeCompletion: false,
  cancel: false,
  mechanism: "clipboard",
  stability: "fallback",
};

function profile(
  ide: IdeId,
  label: string,
  summary: string,
  limitations: string[],
  unsupported: string[],
  capabilities: AgentCapabilities = none,
): IdeProfile {
  return { ide, label, summary, limitations, unsupported, capabilities };
}

export const IDE_CATALOG: IdeProfile[] = [
  profile(
    "cursor",
    "Cursor",
    "Official Cursor SDK can run an agent on a folder you choose. A companion extension can also place text in the chat input through an internal VS Code command. That placement is not agent acceptance.",
    [
      "The SDK starts a Cursor agent session for the selected folder. It does not type into the Composer thread that is already open.",
      "Local SDK runs can edit files and run commands. There is no IDE approval dialog on that path.",
      "Cloud agents can appear in Cursor's Agents window. This build targets a local folder through the SDK.",
      "Placing text with the companion extension uses the internal command workbench.action.chat.open. Cursor staff have said the string form does not auto-submit, and the command is not a stable public contract.",
    ],
    ["Silent paste into the open Composer", "Guaranteed observation of an already-open Composer thread"],
    {
      programmaticSubmit: true,
      projectTargeting: true,
      textContext: true,
      nativeFileAttachments: false,
      images: true,
      readResponses: true,
      observeWorking: true,
      observeCompletion: true,
      cancel: true,
      mechanism: "official_api",
      stability: "supported",
    },
  ),
  profile(
    "vscode",
    "Visual Studio Code",
    "No stable public API submits a prompt into Copilot agent mode. The companion extension can place text in Chat with an internal command and leave submission to you.",
    [
      "vscode.lm can call a language model from an extension. That is a side request, not the IDE agent, so Hooxie does not use it as delivery.",
      "workbench.action.chat.open is an internal command. A VS Code developer suggested isPartialQuery for pre-filling. It is not a guaranteed public API.",
      "Hooxie cannot see whether Copilot accepted, is working, finished, or failed after the text is placed.",
    ],
    ["Verified agent acceptance", "Agent progress", "Cancellation of Copilot agent work", "Native image handoff"],
  ),
  profile(
    "windsurf",
    "Windsurf",
    "Cascade has no documented prompt-submission API. Hooks observe prompts you already sent. They do not submit prompts.",
    [
      "Private Cascade RPC interfaces exist in community write-ups. Hooxie does not call them.",
      "If the companion extension is installed and the chat command exists, Hooxie will only report what that command actually did.",
    ],
    ["Programmatic Cascade submission", "Agent status", "Cancellation", "Image and file handoff"],
  ),
  profile(
    "jetbrains",
    "JetBrains IDEs",
    "JetBrains has said third-party plugins may not call AI Assistant or Junie APIs. ACP lets the IDE host an external agent. It does not let Hooxie submit a prompt to Junie.",
    [
      "Tracked as YouTrack LLM-2340. Internal Junie classes are not a supported integration.",
      "Delivery falls back to the clipboard. You paste into AI Chat yourself.",
    ],
    ["Programmatic prompt submission", "Agent status", "Cancellation", "Image and file handoff"],
  ),
  profile(
    "visualstudio",
    "Visual Studio",
    "GitHub Copilot in Visual Studio has no documented extension API for submitting a chat prompt. This is an open feature request, not a supported integration.",
    ["Delivery falls back to the clipboard."],
    ["Programmatic prompt submission", "Agent status", "Cancellation", "Image and file handoff"],
  ),
  profile(
    "zed",
    "Zed",
    "Zed can host agents through the Agent Client Protocol. That is the opposite direction: the IDE talks to an agent. There is no verified API for an outside app to submit a prompt into Zed's assistant.",
    ["Delivery falls back to the clipboard."],
    ["Programmatic prompt submission", "Agent status", "Cancellation", "Image and file handoff"],
  ),
];

export function catalogFor(ide: IdeId): IdeProfile {
  const found = IDE_CATALOG.find((entry) => entry.ide === ide);
  if (!found) throw new Error(`Unknown IDE ${ide}`);
  return found;
}

export function stabilityLabel(stability: Stability): string {
  switch (stability) {
    case "supported":
      return "Supported";
    case "experimental":
      return "Experimental";
    case "fallback":
      return "Fallback";
    case "unavailable":
      return "Unavailable";
  }
}
