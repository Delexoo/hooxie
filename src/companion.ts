import crypto from "node:crypto";
import type { CompanionSession, IdeId, WorkspaceRef } from "./types.ts";
import { samePath } from "./safety.ts";

export interface BridgeJob {
  id: string;
  promptText: string;
  projectPath: string;
  experimentalSubmit: boolean;
}

export interface JobOutcome {
  outcome: "placed" | "submit_attempted" | "failed";
  detail: string;
  /** True when the extension already took the job and Z must not enqueue it again. */
  handedOff: boolean;
}

interface PendingJob {
  job: BridgeJob;
  resolve: (outcome: JobOutcome) => void;
  timer: NodeJS.Timeout;
  dispatched: boolean;
}

export class CompanionHub {
  private sessions = new Map<string, CompanionSession>();
  private pending = new Map<string, PendingJob[]>();
  private ttlMs: number;
  private resultTimeoutMs: number;

  constructor(ttlMs: number, resultTimeoutMs: number) {
    this.ttlMs = ttlMs;
    this.resultTimeoutMs = resultTimeoutMs;
  }

  hello(input: {
    ide: IdeId | "unknown";
    appName: string;
    extensionVersion: string;
    workspaces: WorkspaceRef[];
  }): CompanionSession {
    const session: CompanionSession = {
      id: crypto.randomBytes(16).toString("hex"),
      ide: input.ide,
      appName: input.appName,
      extensionVersion: input.extensionVersion,
      workspaces: input.workspaces,
      lastSeen: Date.now(),
    };
    this.sessions.set(session.id, session);
    this.pending.set(session.id, []);
    return session;
  }

  touch(sessionId: string, workspaces?: WorkspaceRef[]): CompanionSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    session.lastSeen = Date.now();
    if (workspaces) session.workspaces = workspaces;
    return session;
  }

  list(): CompanionSession[] {
    const now = Date.now();
    return [...this.sessions.values()].filter((session) => now - session.lastSeen <= this.ttlMs);
  }

  matching(ide: IdeId, projectPath: string): CompanionSession[] {
    return this.list().filter(
      (session) =>
        session.ide === ide && session.workspaces.some((workspace) => samePath(workspace.path, projectPath)),
    );
  }

  poll(sessionId: string): BridgeJob | null {
    const session = this.touch(sessionId);
    if (!session) return null;
    const queue = this.pending.get(sessionId) ?? [];
    const next = queue.find((item) => !item.dispatched);
    if (!next) return null;
    next.dispatched = true;
    return next.job;
  }

  enqueue(sessionId: string, job: BridgeJob): Promise<JobOutcome> {
    const session = this.sessions.get(sessionId);
    if (!session || Date.now() - session.lastSeen > this.ttlMs) {
      return Promise.reject(new Error("disconnected"));
    }
    const queue = this.pending.get(sessionId);
    if (!queue) return Promise.reject(new Error("disconnected"));
    return new Promise((resolve) => {
      const entry: PendingJob = {
        job,
        resolve,
        dispatched: false,
        timer: setTimeout(() => {
          const handedOff = entry.dispatched;
          this.remove(sessionId, job.id);
          resolve({
            outcome: "failed",
            handedOff,
            detail: handedOff
              ? "The extension took the prompt but did not confirm. Check the IDE chat before trying again. Hooxie will not send this prompt again."
              : "The extension did not pick up the prompt. Nothing was sent.",
          });
        }, this.resultTimeoutMs),
      };
      queue.push(entry);
    });
  }

  complete(sessionId: string, jobId: string, outcome: JobOutcome): boolean {
    const queue = this.pending.get(sessionId);
    if (!queue) return false;
    const index = queue.findIndex((item) => item.job.id === jobId);
    if (index < 0) return false;
    const [item] = queue.splice(index, 1);
    clearTimeout(item.timer);
    item.resolve({ ...outcome, handedOff: true });
    return true;
  }

  private remove(sessionId: string, jobId: string): void {
    const queue = this.pending.get(sessionId);
    if (!queue) return;
    const index = queue.findIndex((item) => item.job.id === jobId);
    if (index >= 0) queue.splice(index, 1);
  }
}
