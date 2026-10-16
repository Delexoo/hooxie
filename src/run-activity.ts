import { execFile } from "node:child_process";

export interface RunTerminal {
  id: string;
  command: string;
  status: "running" | "done" | "error";
  background: boolean;
}

export interface RunFileChange {
  path: string;
  kind: "modified" | "added" | "deleted";
}

export interface RunActivity {
  terminals: RunTerminal[];
  files: RunFileChange[];
}

export function emptyActivity(): RunActivity {
  return { terminals: [], files: [] };
}

export function joinReply(current: string, incoming: string): string {
  if (!incoming) return current;
  if (!current) return incoming;
  if (incoming.startsWith(current)) return incoming;
  if (current.endsWith(incoming)) return current;
  return current + incoming;
}

export function replyFromMessage(message: unknown): string {
  if (!message || typeof message !== "object") return "";
  const record = message as { type?: string; message?: { content?: { type?: string; text?: string }[] } };
  if (record.type !== "assistant" || !Array.isArray(record.message?.content)) return "";
  return record.message.content
    .filter((block) => block?.type === "text" && typeof block.text === "string")
    .map((block) => block.text as string)
    .join("");
}

export function foldActivity(current: RunActivity, message: unknown): RunActivity {
  const call = readToolCall(message);
  if (!call) return current;
  if (isShell(call.name)) return foldShell(current, call);
  if (isFileTool(call.name)) return foldFile(current, call);
  return current;
}

export function mergeFileChanges(current: RunFileChange[], incoming: RunFileChange[]): RunFileChange[] {
  if (!incoming.length) return current;
  const files = current.slice(0, 80);
  let changed = false;
  for (const file of incoming) {
    if (!file.path) continue;
    const index = files.findIndex((item) => item.path === file.path);
    if (index >= 0) {
      if (files[index].kind !== file.kind) {
        files[index] = file;
        changed = true;
      }
      continue;
    }
    if (files.length >= 80) continue;
    files.push(file);
    changed = true;
  }
  return changed ? files : current;
}

export function parsePorcelain(text: string): Map<string, string> {
  const map = new Map<string, string>();
  const parts = text.split("\0").filter((part) => part.length > 0);
  for (let index = 0; index < parts.length; index += 1) {
    const entry = parts[index];
    if (entry.length < 4) continue;
    const code = entry.slice(0, 2);
    const filePath = entry.slice(3);
    if ((code.startsWith("R") || code.startsWith("C")) && parts[index + 1]) {
      map.set(parts[index + 1], code);
      index += 1;
      continue;
    }
    if (filePath) map.set(filePath, code);
  }
  return map;
}

export function changedSince(before: Map<string, string>, after: Map<string, string>): RunFileChange[] {
  const files: RunFileChange[] = [];
  for (const [filePath, code] of after) {
    if (before.get(filePath) === code) continue;
    files.push({ path: filePath, kind: kindForCode(code) });
  }
  return files;
}

export function readGitStatus(cwd: string): Promise<Map<string, string>> {
  return new Promise((resolve) => {
    execFile(
      "git",
      ["-C", cwd, "status", "--porcelain=v1", "-z"],
      { windowsHide: true, timeout: 4000, maxBuffer: 1_000_000 },
      (error, stdout) => {
        if (error) {
          resolve(new Map());
          return;
        }
        resolve(parsePorcelain(String(stdout)));
      },
    );
  });
}

function foldShell(current: RunActivity, call: ToolCall): RunActivity {
  const command = commandOf(call.args) || "Terminal";
  const background = isBackground(call.args);
  const status = call.status === "error" ? "error" : call.status === "completed" && !background ? "done" : "running";
  const terminals = current.terminals.slice(0, 30);
  const index = terminals.findIndex((item) => item.id === call.id);
  const next: RunTerminal = { id: call.id, command, status, background: background || (index >= 0 && terminals[index].background) };
  if (index >= 0) terminals[index] = next;
  else if (terminals.length < 30) terminals.push(next);
  return { terminals, files: current.files };
}

function foldFile(current: RunActivity, call: ToolCall): RunActivity {
  const filePath = pathOf(call.args);
  if (!filePath) return current;
  const kind = call.name.toLowerCase().includes("delete") ? "deleted" : call.name.toLowerCase() === "write" ? "added" : "modified";
  return { terminals: current.terminals, files: mergeFileChanges(current.files, [{ path: filePath, kind }]) };
}

interface ToolCall {
  id: string;
  name: string;
  status: string;
  args: unknown;
}

function readToolCall(message: unknown): ToolCall | undefined {
  if (!message || typeof message !== "object") return undefined;
  const record = message as Record<string, unknown>;
  if (record.type !== "tool_call") return undefined;
  const name = typeof record.name === "string" ? record.name : "";
  const id = typeof record.call_id === "string" ? record.call_id : "";
  if (!name || !id) return undefined;
  const status = typeof record.status === "string" ? record.status : "running";
  return { id, name, status, args: record.args };
}

function isShell(name: string): boolean {
  const normalized = name.toLowerCase();
  return normalized === "shell" || normalized === "bash" || normalized.includes("shell");
}

function isFileTool(name: string): boolean {
  const normalized = name.toLowerCase();
  return normalized === "edit" || normalized === "write" || normalized === "delete" || normalized.includes("strreplace") || normalized.includes("applyagentdiff");
}

function commandOf(args: unknown): string {
  const record = asRecord(args);
  const direct = stringField(record, "command") || stringField(record, "cmd");
  if (direct) return clip(direct);
  const nested = asRecord(record.shell);
  return clip(stringField(nested, "command"));
}

function pathOf(args: unknown): string {
  const record = asRecord(args);
  for (const key of ["path", "file_path", "filePath", "target_file", "targetFile", "file"]) {
    const value = stringField(record, key);
    if (value) return clip(value.replaceAll("\\", "/"));
  }
  return "";
}

function isBackground(args: unknown): boolean {
  const record = asRecord(args);
  if (record.block_until_ms === 0 || record.blockUntilMs === 0) return true;
  return record.is_background === true || record.isBackground === true || record.background === true;
}

function kindForCode(code: string): RunFileChange["kind"] {
  if (code.includes("D")) return "deleted";
  if (code.includes("A") || code.includes("?")) return "added";
  return "modified";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function clip(value: string): string {
  return value.replace(/\s+/g, " ").slice(0, 180);
}
