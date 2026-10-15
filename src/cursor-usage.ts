import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const USAGE_URL = "https://api2.cursor.sh/aiserver.v1.DashboardService/GetCurrentPeriodUsage";
const PLAN_URL = "https://api2.cursor.sh/aiserver.v1.DashboardService/GetPlanInfo";
const CREDITS_URL = "https://api2.cursor.sh/aiserver.v1.DashboardService/GetCreditGrantsBalance";
const GRANTS_URL = "https://api2.cursor.sh/aiserver.v1.DashboardService/GetUsageLimitStatusAndActiveGrants";
const STRIPE_URL = "https://cursor.com/api/auth/stripe";

export type CursorCredits = {
  remainingCents: number;
  totalCents: number;
  expiresAtMs: number | null;
};

export type CursorUsageDetails = {
  planName: string | null;
  price: string | null;
  includedCents: number | null;
  limitCents: number | null;
  bonusCents: number | null;
  autoPercent: number | null;
  apiPercent: number | null;
  resetsAtMs: number | null;
};

export type CursorUsage = {
  percent: number | null;
  credits: CursorCredits | null;
  details: CursorUsageDetails;
};

const EMPTY_DETAILS: CursorUsageDetails = {
  planName: null,
  price: null,
  includedCents: null,
  limitCents: null,
  bonusCents: null,
  autoPercent: null,
  apiPercent: null,
  resetsAtMs: null,
};

const STRIPE_PLANS: Record<string, string> = {
  pro: "Pro",
  pro_plus: "Pro+",
  ultra: "Ultra",
  free: "Free",
  hobby: "Hobby",
  business: "Business",
  enterprise: "Enterprise",
  team: "Team",
};

let cache: { at: number; usage: CursorUsage } | null = null;

export function usagePercent(body: unknown): number | null {
  const root = asRecord(body);
  const individual = asRecord(root.individualUsage ?? root.individual_usage);
  const plan = asRecord(
    root.planUsage
    ?? root.plan_usage
    ?? individual.plan
    ?? asRecord(individual).planUsage
    ?? root.plan,
  );
  if (!hasFields(plan)) return null;
  const reported = num(plan.totalPercentUsed ?? plan.total_percent_used);
  if (reported != null) return clamp(Math.round(reported));
  const limit = num(plan.limit);
  const included = num(plan.includedSpend ?? plan.included_spend ?? plan.used);
  if (limit != null && limit > 0 && included != null) return clamp(Math.round((included / limit) * 100));
  return null;
}

export function creditBalance(body: unknown): CursorCredits | null {
  const record = asRecord(body);
  if (record.hasCreditGrants === true || record.has_credit_grants === true) {
    const total = intCents(record.totalCents ?? record.total_cents);
    const used = intCents(record.usedCents ?? record.used_cents) ?? 0;
    if (total != null && total > 0) {
      return {
        remainingCents: Math.max(0, total - used),
        totalCents: total,
        expiresAtMs: ms(record.expiresAtMs ?? record.expires_at_ms ?? record.expireAtMs),
      };
    }
  }
  return null;
}

export function activeGrantCredits(body: unknown): CursorCredits | null {
  const grants = asRecord(body).activeGrants ?? asRecord(body).active_grants;
  if (!Array.isArray(grants) || grants.length === 0) return null;
  let remaining = 0;
  let total = 0;
  let expiresAtMs: number | null = null;
  for (const item of grants) {
    const grant = asRecord(item);
    const grantTotal = intCents(grant.totalCents ?? grant.total_cents);
    const grantRemaining = intCents(grant.remainingCents ?? grant.remaining_cents);
    if (grantTotal != null && grantTotal > 0) total += grantTotal;
    if (grantRemaining != null && grantRemaining > 0) remaining += grantRemaining;
    else if (grantTotal != null && grantTotal > 0 && grantRemaining == null) remaining += grantTotal;
    const when = ms(grant.expiresAtMs ?? grant.expires_at_ms ?? grant.expireAtMs);
    if (when != null) expiresAtMs = expiresAtMs == null ? when : Math.min(expiresAtMs, when);
  }
  if (total <= 0 && remaining <= 0) return null;
  if (total <= 0) total = remaining;
  return { remainingCents: remaining, totalCents: total, expiresAtMs };
}

export function usageDetails(periodBody: unknown, planBody: unknown, stripeBody: unknown): CursorUsageDetails {
  const root = asRecord(periodBody);
  const plan = asRecord(root.planUsage ?? root.plan_usage);
  const info = asRecord(asRecord(planBody).planInfo ?? asRecord(planBody).plan_info);
  const bonus = intCents(plan.bonusSpend ?? plan.bonus_spend);
  const limit = intCents(plan.limit);
  return {
    planName: planName(info.planName ?? info.plan_name) ?? stripePlanName(stripeBody),
    price: planPrice(info.price),
    includedCents: nonNegativeCents(plan.includedSpend ?? plan.included_spend),
    limitCents: limit != null && limit > 0 ? limit : null,
    bonusCents: bonus != null && bonus > 0 ? bonus : null,
    autoPercent: reportedPercent(plan.autoPercentUsed ?? plan.auto_percent_used),
    apiPercent: reportedPercent(plan.apiPercentUsed ?? plan.api_percent_used),
    resetsAtMs: ms(root.billingCycleEnd ?? root.billing_cycle_end) ?? ms(info.billingCycleEnd ?? info.billing_cycle_end),
  };
}

export function stripeCreditCents(body: unknown): number {
  const balance = num(asRecord(body).customerBalance ?? asRecord(body).customer_balance);
  if (balance == null || balance >= 0) return 0;
  return Math.abs(Math.round(balance));
}

export function mergeCredits(
  grant: CursorCredits | null,
  active: CursorCredits | null,
  stripeCents: number,
): CursorCredits | null {
  const base = grant ?? active;
  if (!base && stripeCents <= 0) return null;
  const remainingCents = (base?.remainingCents ?? 0) + stripeCents;
  const totalCents = (base?.totalCents ?? 0) + stripeCents;
  if (totalCents <= 0 && remainingCents <= 0) return null;
  return {
    remainingCents,
    totalCents: totalCents > 0 ? totalCents : remainingCents,
    expiresAtMs: base?.expiresAtMs ?? null,
  };
}

export async function readCursorUsage(options: {
  appData?: string;
  now?: number;
  fetchImpl?: typeof fetch;
  token?: string;
} = {}): Promise<CursorUsage> {
  const now = options.now ?? Date.now();
  const isolated = Boolean(options.fetchImpl || options.token);
  if (!isolated && cache && now - cache.at < 60_000) return cache.usage;
  const token = options.token ?? readCursorToken(options.appData);
  const usage = token
    ? await fetchUsageBundle(token, options.fetchImpl ?? fetch)
    : { percent: null, credits: null, details: EMPTY_DETAILS };
  if (!isolated) cache = { at: now, usage };
  return usage;
}

async function fetchUsageBundle(token: string, fetchImpl: typeof fetch): Promise<CursorUsage> {
  const [usageBody, planBody, creditBody, grantBody, stripeBody] = await Promise.all([
    connectJson(USAGE_URL, token, fetchImpl),
    connectJson(PLAN_URL, token, fetchImpl),
    connectJson(CREDITS_URL, token, fetchImpl),
    connectJson(GRANTS_URL, token, fetchImpl),
    stripeJson(token, fetchImpl),
  ]);
  return {
    percent: usageBody ? usagePercent(usageBody) : null,
    credits: mergeCredits(
      creditBody ? creditBalance(creditBody) : null,
      grantBody ? activeGrantCredits(grantBody) : null,
      stripeBody ? stripeCreditCents(stripeBody) : 0,
    ),
    details: usageDetails(usageBody, planBody, stripeBody),
  };
}

async function connectJson(url: string, token: string, fetchImpl: typeof fetch): Promise<unknown | null> {
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: "{}",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function stripeJson(token: string, fetchImpl: typeof fetch): Promise<unknown | null> {
  const session = sessionCookie(token);
  if (!session) return null;
  try {
    const response = await fetchImpl(STRIPE_URL, {
      method: "GET",
      headers: { cookie: session },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function sessionCookie(token: string): string {
  const userId = tokenSubject(token);
  if (!userId) return "";
  return `WorkosCursorSessionToken=${userId}%3A%3A${token}`;
}

function tokenSubject(token: string): string {
  const parts = token.split(".");
  if (parts.length < 2) return "";
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { sub?: unknown };
    const sub = payload.sub == null ? "" : String(payload.sub);
    const bits = sub.split("|");
    return (bits[1] || bits[0] || "").trim();
  } catch {
    return "";
  }
}

function readCursorToken(appData = process.env.APPDATA): string {
  if (!appData) return "";
  const dbPath = path.join(appData, "Cursor", "User", "globalStorage", "state.vscdb");
  if (!fs.existsSync(dbPath)) return "";
  try {
    const module = createRequire(import.meta.url)("node:sqlite") as {
      DatabaseSync: new (file: string, options: { readOnly: boolean }) => {
        prepare(sql: string): { get(key: string): { value?: unknown } | undefined };
        close(): void;
      };
    };
    const db = new module.DatabaseSync(dbPath, { readOnly: true });
    try {
      const row = db.prepare("SELECT value FROM ItemTable WHERE key = ?").get("cursorAuth/accessToken");
      const token = row?.value == null ? "" : String(row.value).trim().replace(/^"|"$/g, "");
      return token.length >= 20 ? token : "";
    } finally {
      db.close();
    }
  } catch {
    return "";
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function hasFields(record: Record<string, unknown>): boolean {
  return Object.keys(record).length > 0;
}

function num(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function intCents(value: unknown): number | null {
  const parsed = num(value);
  return parsed == null ? null : Math.round(parsed);
}

function ms(value: unknown): number | null {
  const parsed = num(value);
  return parsed == null || parsed <= 0 ? null : Math.round(parsed);
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function reportedPercent(value: unknown): number | null {
  const parsed = num(value);
  return parsed == null ? null : clamp(Math.round(parsed));
}

function nonNegativeCents(value: unknown): number | null {
  const parsed = intCents(value);
  return parsed == null || parsed < 0 ? null : parsed;
}

function planName(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z0-9][A-Za-z0-9 +.-]{0,23}$/.test(text) ? text : null;
}

function planPrice(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return /^\$\d{1,4}(?:\.\d{1,2})?\/(?:mo|yr)$/.test(text) ? text : null;
}

function stripePlanName(body: unknown): string | null {
  const record = asRecord(body);
  const raw = record.individualMembershipType ?? record.individual_membership_type ?? record.membershipType ?? record.membership_type;
  const key = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  return STRIPE_PLANS[key] ?? null;
}
