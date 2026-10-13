import { spawn } from "node:child_process";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import type { ClipboardPort } from "./adapters.ts";

const execFileAsync = promisify(execFile);

export function createWindowsClipboard(): ClipboardPort {
  return {
    async write(text: string) {
      await runPowershell(text, "[Console]::InputEncoding = [Text.UTF8Encoding]::new($false); $t = [Console]::In.ReadToEnd(); Set-Clipboard -Value $t");
    },
    async read() {
      const { stdout } = await execFileAsync(
        "powershell.exe",
        ["-NoProfile", "-STA", "-Command", "[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false); Get-Clipboard -Raw"],
        { timeout: 8000, windowsHide: true, maxBuffer: 2_000_000 },
      );
      return stdout.replace(/\r?\n$/, "");
    },
  };
}

function runPowershell(stdin: string, command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("powershell.exe", ["-NoProfile", "-STA", "-Command", command], {
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Clipboard timed out."));
    }, 8000);
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || "Clipboard write failed."));
    });
    child.stdin.write(stdin, "utf8");
    child.stdin.end();
  });
}
