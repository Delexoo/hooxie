import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import type { IdeId, Installation } from "./types.ts";

const execFileAsync = promisify(execFile);

export interface DetectDeps {
  where: (name: string) => Promise<string[]>;
  exists: (file: string) => boolean;
  env: NodeJS.ProcessEnv;
  walk: (root: string, names: Set<string>) => string[];
  vswhere: () => Promise<string | undefined>;
}

export async function detectInstallations(deps: DetectDeps = defaultDeps()): Promise<Installation[]> {
  const found: Installation[] = [];
  await addCliIde(found, deps, "cursor", "Cursor", "Cursor.exe", [
    path.join(deps.env.LOCALAPPDATA ?? "", "Programs", "cursor", "Cursor.exe"),
    "C:\\Program Files\\cursor\\Cursor.exe",
  ]);
  await addCliIde(found, deps, "vscode", "Visual Studio Code", "Code.exe", [
    path.join(deps.env.LOCALAPPDATA ?? "", "Programs", "Microsoft VS Code", "Code.exe"),
  ]);
  await addCliIde(found, deps, "windsurf", "Windsurf", "Windsurf.exe", [
    path.join(deps.env.LOCALAPPDATA ?? "", "Programs", "Windsurf", "Windsurf.exe"),
  ]);
  await addCliIde(found, deps, "zed", "Zed", "Zed.exe", [
    path.join(deps.env.LOCALAPPDATA ?? "", "Programs", "Zed", "Zed.exe"),
  ]);

  const jetRoots = [
    "C:\\Program Files\\JetBrains",
    path.join(deps.env.LOCALAPPDATA ?? "", "JetBrains"),
  ];
  const jetNames = new Set(["idea64.exe", "webstorm64.exe", "pycharm64.exe", "rider64.exe", "clion64.exe", "goland64.exe"]);
  let jetIndex = 0;
  for (const root of jetRoots) {
    for (const exe of deps.walk(root, jetNames)) {
      jetIndex += 1;
      found.push({
        id: `jetbrains-${jetIndex}`,
        ide: "jetbrains",
        label: `JetBrains (${path.basename(exe, ".exe")})`,
        executable: exe,
      });
    }
  }

  const devenv = await deps.vswhere();
  if (devenv && deps.exists(devenv)) {
    found.push({
      id: "visualstudio-1",
      ide: "visualstudio",
      label: "Visual Studio",
      executable: devenv,
    });
  }

  return dedupe(found);
}

async function addCliIde(
  found: Installation[],
  deps: DetectDeps,
  ide: IdeId,
  label: string,
  exeName: string,
  candidates: string[],
): Promise<void> {
  const bins = [...(await deps.where(ide === "vscode" ? "code" : ide)), ...candidates];
  for (const bin of bins) {
    const exe = resolveGui(bin, exeName, deps.exists);
    if (!exe) continue;
    found.push({ id: `${ide}-1`, ide, label, executable: exe });
    return;
  }
}

function resolveGui(bin: string, exeName: string, exists: (file: string) => boolean): string | undefined {
  const dir = path.dirname(bin);
  const candidates = [
    path.resolve(dir, "..", "..", "..", exeName),
    path.resolve(dir, "..", exeName),
    bin,
  ];
  return candidates.find((candidate) => exists(candidate));
}

function dedupe(list: Installation[]): Installation[] {
  const seen = new Set<string>();
  const out: Installation[] = [];
  for (const item of list) {
    const key = item.executable.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function defaultDeps(): DetectDeps {
  return {
    where: whereExe,
    exists: fs.existsSync,
    env: process.env,
    walk: boundedWalk,
    vswhere: readVswhere,
  };
}

async function whereExe(name: string): Promise<string[]> {
  if (process.platform !== "win32") return [];
  try {
    const { stdout } = await execFileAsync("where.exe", [name], { timeout: 4000, windowsHide: true });
    return stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function boundedWalk(root: string, names: Set<string>): string[] {
  const acc: string[] = [];
  walk(root, names, 5, acc);
  return acc;
}

function walk(root: string, names: Set<string>, depth: number, acc: string[]): void {
  if (depth < 0 || acc.length >= 8 || !root || !fs.existsSync(root)) return;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (acc.length >= 8) return;
    if (entry.name === "jbr" || entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(root, entry.name);
    if (entry.isFile() && names.has(entry.name.toLowerCase())) acc.push(full);
    else if (entry.isDirectory()) walk(full, names, depth - 1, acc);
  }
}

async function readVswhere(): Promise<string | undefined> {
  if (process.platform !== "win32") return undefined;
  const vswhere = path.join(
    process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)",
    "Microsoft Visual Studio",
    "Installer",
    "vswhere.exe",
  );
  if (!fs.existsSync(vswhere)) return undefined;
  try {
    const { stdout } = await execFileAsync(vswhere, ["-latest", "-products", "*", "-property", "productPath"], {
      timeout: 5000,
      windowsHide: true,
    });
    const line = stdout
      .split(/\r?\n/)
      .map((item) => item.trim())
      .find(Boolean);
    return line;
  } catch {
    return undefined;
  }
}
