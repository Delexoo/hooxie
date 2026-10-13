export interface HelloMessage {
  v: number;
  ide: "cursor" | "vscode" | "windsurf" | "jetbrains" | "visualstudio" | "zed" | "unknown";
  appName: string;
  extensionVersion: string;
  workspaces: { path: string; name: string }[];
}

export interface ResultMessage {
  v: number;
  id: string;
  outcome: "placed" | "submit_attempted" | "failed";
  detail: string;
}

export interface JobMessage {
  id: string;
  promptText: string;
  projectPath: string;
  experimentalSubmit: boolean;
}

export function validateHello(input: unknown): { ok: true; value: HelloMessage } | { ok: false; error: string };
export function validateResult(input: unknown): { ok: true; value: ResultMessage } | { ok: false; error: string };
export function chatOpenArgs(job: { promptText: string; experimentalSubmit?: boolean }): {
  query: string;
  isPartialQuery: boolean;
};
export function validateJob(input: unknown): { ok: true; value: JobMessage } | { ok: false; error: string };
