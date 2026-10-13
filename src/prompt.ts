import fs from "node:fs/promises";
import path from "node:path";
import type { ImageAttachment } from "./types.ts";
import { DeliveryError } from "./types.ts";

const MARKER_NAMES = new Set([
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "cargo.toml",
  "go.mod",
  "pyproject.toml",
  "requirements.txt",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "composer.json",
  "gemfile",
  "package.swift",
  "tsconfig.json",
  "go.work",
]);

export async function stackMarkers(projectPath: string): Promise<string[]> {
  let names: string[];
  try {
    names = await fs.readdir(projectPath);
  } catch {
    throw new DeliveryError(400, "The project folder could not be read for stack markers.");
  }
  const found: string[] = [];
  for (const name of names) {
    const lower = name.toLowerCase();
    if (MARKER_NAMES.has(lower) || lower.endsWith(".csproj") || lower.endsWith(".sln")) {
      found.push(name);
    }
  }
  found.sort((a, b) => a.localeCompare(b));
  return found;
}

export function buildPromptText(input: {
  prompt: string;
  projectPath: string;
  additionalInstructions: string;
  includeProjectPath: boolean;
  includeScreen: boolean;
  markers: string[] | null;
  files: { relativePath: string; content: string }[];
  uploads: { name: string; content: string }[];
}): string {
  const parts: string[] = [input.prompt.trim()];
  const context: string[] = [];
  if (input.additionalInstructions.trim()) {
    context.push(`Additional instructions:\n${input.additionalInstructions.trim()}`);
  }
  if (input.includeProjectPath) {
    context.push(`Project path: ${input.projectPath}`);
  }
  if (input.includeScreen) {
    context.push("A screenshot of the user's current screen is attached. Use it as visual context for this request.");
  }
  if (input.markers) {
    context.push(
      input.markers.length
        ? `Stack markers in the project root: ${input.markers.join(", ")}`
        : "Stack markers in the project root: none recognized.",
    );
  }
  for (const file of input.files) {
    context.push(`File ${file.relativePath}:\n-----\n${file.content}\n-----`);
  }
  for (const upload of input.uploads) {
    context.push(`Uploaded file ${upload.name}:\n-----\n${upload.content}\n-----`);
  }
  if (context.length) {
    parts.push("Context the user explicitly attached from Hooxie:\n\n" + context.join("\n\n"));
  }
  return parts.join("\n\n");
}

export function assertProjectDirectory(projectPath: string): void {
  if (!path.isAbsolute(projectPath)) {
    throw new DeliveryError(400, "Choose an absolute project path. Hooxie will not guess from its own folder.");
  }
}

export async function assertDirectoryExists(projectPath: string): Promise<void> {
  let stat;
  try {
    stat = await fs.stat(projectPath);
  } catch {
    throw new DeliveryError(400, "That project folder does not exist.");
  }
  if (!stat.isDirectory()) throw new DeliveryError(400, "The project path is not a folder.");
}

export function imageFingerprint(images: ImageAttachment[]): string {
  return images.map((image) => `${image.mimeType}:${image.data.length}:${image.data.slice(0, 32)}`).join("|");
}
