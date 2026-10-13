import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

export interface CursorStep {
  id: "install" | "connect" | "plan";
  title: string;
  detail: string;
  done: boolean;
  href?: string;
}

export interface CursorReadyReport {
  installed: boolean;
  signedIn: boolean;
  plan: string | null;
  planActive: boolean;
  ready: boolean;
  steps: CursorStep[];
}

const PLAN_LABELS: Record<string, string> = {
  free: "Hobby",
  hobby: "Hobby",
  pro: "Pro",
  pro_plus: "Pro+",
  ultra: "Ultra",
  business: "Business",
  enterprise: "Enterprise",
};

const BLOCKED_STATUS = new Set([
  "canceled",
  "cancelled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "unpaid",
  "paused",
]);

export function assessCursor(input: {
  installed: boolean;
  signedIn: boolean;
  membership: string;
  subscriptionStatus: string;
}): CursorReadyReport {
  const membership = input.membership.trim().toLowerCase();
  const status = input.subscriptionStatus.trim().toLowerCase();
  const plan = PLAN_LABELS[membership] ?? "";
  const blocked = BLOCKED_STATUS.has(status);
  const planActive = input.signedIn && Boolean(plan) && !blocked;
  const ready = input.installed && input.signedIn && planActive;
  return {
    installed: input.installed,
    signedIn: input.signedIn,
    plan: plan || null,
    planActive,
    ready,
    steps: [
      {
        id: "install",
        title: "Download the Cursor app",
        detail: input.installed
          ? "Cursor is installed on this computer."
          : "Download Cursor from cursor.com, install it, and open it once.",
        done: input.installed,
        href: "https://cursor.com/download",
      },
      {
        id: "connect",
        title: "Open Cursor and sign in",
        detail: input.signedIn
          ? "Hooxie can connect to the Cursor account on this computer."
          : "Open the Cursor app and sign in so Hooxie can connect to it.",
        done: input.installed && input.signedIn,
      },
      {
        id: "plan",
        title: "Use an available Cursor plan",
        detail: planDetail(input.signedIn, plan, blocked),
        done: planActive,
        href: "https://cursor.com/pricing",
      },
    ],
  };
}

function planDetail(signedIn: boolean, plan: string, blocked: boolean): string {
  if (plan && !blocked) return `${plan} is available for this account.`;
  if (!signedIn) return "Sign in to Cursor, then choose Hobby, Pro, or Business. The plan has to be active.";
  if (blocked) return "The Cursor plan on this account is not active. Open Cursor and choose an available plan.";
  return "Open Cursor and choose Hobby, Pro, or Business. Hooxie sends prompts only when that plan is active.";
}

export async function readCursorReady(options: { executable?: string; appData?: string } = {}): Promise<CursorReadyReport> {
  const installed = Boolean(options.executable);
  const account = installed ? readCursorAccount(options.appData) : { signedIn: false, membership: "", subscriptionStatus: "" };
  return assessCursor({
    installed,
    signedIn: account.signedIn,
    membership: account.membership,
    subscriptionStatus: account.subscriptionStatus,
  });
}

function readCursorAccount(appData = process.env.APPDATA): { signedIn: boolean; membership: string; subscriptionStatus: string } {
  const empty = { signedIn: false, membership: "", subscriptionStatus: "" };
  if (!appData) return empty;
  const dbPath = path.join(appData, "Cursor", "User", "globalStorage", "state.vscdb");
  if (!fs.existsSync(dbPath)) return empty;
  try {
    const values = readAuthValues(dbPath);
    const email = values["cursorAuth/cachedEmail"] ?? "";
    const token = values["cursorAuth/accessToken"] ?? "";
    return {
      signedIn: Boolean(email.trim() || token.trim()),
      membership: values["cursorAuth/stripeMembershipType"] ?? "",
      subscriptionStatus: values["cursorAuth/stripeSubscriptionStatus"] ?? "",
    };
  } catch {
    return empty;
  }
}

function readAuthValues(dbPath: string): Record<string, string> {
  const keys = [
    "cursorAuth/cachedEmail",
    "cursorAuth/accessToken",
    "cursorAuth/stripeMembershipType",
    "cursorAuth/stripeSubscriptionStatus",
  ];
  const module = requireNodeSqlite();
  const db = new module.DatabaseSync(dbPath, { readOnly: true });
  try {
    const statement = db.prepare("SELECT value FROM ItemTable WHERE key = ?");
    const values: Record<string, string> = {};
    for (const key of keys) {
      const row = statement.get(key) as { value?: unknown } | undefined;
      values[key] = row?.value == null ? "" : String(row.value);
    }
    return values;
  } finally {
    db.close();
  }
}

function requireNodeSqlite(): { DatabaseSync: new (path: string, options: { readOnly: boolean }) => { prepare(sql: string): { get(key: string): unknown }; close(): void } } {
  return createRequire(import.meta.url)("node:sqlite") as never;
}
