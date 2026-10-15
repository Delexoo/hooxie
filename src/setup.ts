import { IDE_CATALOG, IDE_DOWNLOADS, MORE_IDES } from "./catalog.ts";
import type { IdeId, Installation } from "./types.ts";

export type SetupPhase = "download" | "connect" | "license" | "ready";
export type OnboardingStep = "" | "download" | "connect";

export function onboardingStep(value: unknown): OnboardingStep {
  return value === "download" || value === "connect" ? value : "";
}

export interface SetupIde {
  ide: IdeId;
  label: string;
  installed: boolean;
}

export interface SetupDownload {
  id: string;
  label: string;
}

export interface SetupReport {
  phase: SetupPhase;
  licensed: boolean;
  connectedIde: string;
  ides: SetupIde[];
  more: SetupDownload[];
}

export function describeSetup(input: {
  installations: Pick<Installation, "ide">[];
  connectedIde: string;
  cursorConnected: boolean;
  licensed: boolean;
  onboardingStep?: OnboardingStep;
}): SetupReport {
  const installed = new Set(input.installations.map((item) => item.ide));
  const chosen = installed.has(input.connectedIde as IdeId) ? input.connectedIde : "";
  const chosenReady = chosen === "cursor" ? input.cursorConnected : Boolean(chosen);
  const cursorReady = input.cursorConnected && installed.has("cursor");
  const replay = onboardingStep(input.onboardingStep);
  let phase: SetupPhase = "connect";
  if (installed.size === 0) phase = "download";
  else if (replay === "download" || replay === "connect") phase = "connect";
  else if (chosenReady || cursorReady) phase = input.licensed ? "ready" : "license";
  return {
    phase,
    licensed: input.licensed === true,
    connectedIde: phase === "ready" ? (chosen || (cursorReady ? "cursor" : "")) : chosen,
    ides: IDE_CATALOG.map((entry) => ({
      ide: entry.ide,
      label: entry.label,
      installed: installed.has(entry.ide),
    })),
    more: MORE_IDES.map((id) => ({ id, label: IDE_DOWNLOADS[id].label })),
  };
}
