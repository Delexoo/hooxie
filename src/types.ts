export const IDE_IDS = ["cursor", "vscode", "windsurf", "jetbrains", "visualstudio", "zed"] as const;

export type IdeId = (typeof IDE_IDS)[number];

export type DeliveryStatus =
  | "ready"
  | "preparing"
  | "sending"
  | "delivered"
  | "awaiting_user_action"
  | "agent_working"
  | "completed"
  | "failed"
  | "disconnected"
  | "status_unavailable";

export type DeliveryPhase =
  | "prepared"
  | "delivered"
  | "accepted"
  | "processing"
  | "completed"
  | "awaiting_user"
  | "failed";

export type Mechanism = "official_api" | "companion_extension" | "clipboard" | "unavailable";

export type Stability = "supported" | "experimental" | "fallback" | "unavailable";

export interface AgentCapabilities {
  programmaticSubmit: boolean;
  projectTargeting: boolean;
  textContext: boolean;
  nativeFileAttachments: boolean;
  images: boolean;
  readResponses: boolean;
  observeWorking: boolean;
  observeCompletion: boolean;
  cancel: boolean;
  mechanism: Mechanism;
  stability: Stability;
}

export interface Installation {
  id: string;
  ide: IdeId;
  label: string;
  executable: string;
}

export interface WorkspaceRef {
  path: string;
  name: string;
}

export interface CompanionSession {
  id: string;
  ide: IdeId | "unknown";
  appName: string;
  extensionVersion: string;
  workspaces: WorkspaceRef[];
  lastSeen: number;
}

export interface ImageAttachment {
  data: string;
  mimeType: string;
}

export interface UploadedFile {
  name: string;
  content: string;
}

export interface SubmitInput {
  idempotencyKey: string;
  routeId: string;
  ide: IdeId;
  installationId?: string;
  projectPath: string;
  prompt: string;
  additionalInstructions: string;
  includeProjectPath: boolean;
  includeStackMarkers: boolean;
  includeScreen: boolean;
  files: string[];
  uploads: UploadedFile[];
  images: ImageAttachment[];
  allowUnsandboxed: boolean;
  experimentalSubmit: boolean;
  confirmDestination: boolean;
  retry: boolean;
}

export interface PublicDelivery {
  id: string;
  status: DeliveryStatus;
  phase: DeliveryPhase;
  detail: string;
  destination: string;
  ide: IdeId;
  routeId: string;
  projectPath: string;
  mechanism: Mechanism;
  responseText?: string;
  responseVerified: boolean;
  limitations: string[];
  committed: boolean;
  retryable: boolean;
  canCancel: boolean;
  unsupported: string[];
  thought?: string;
  process?: string;
  terminals: { id: string; command: string; status: "running" | "done" | "error" }[];
  files: { path: string; kind: "modified" | "added" | "deleted" }[];
}

export class DeliveryError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "DeliveryError";
    this.statusCode = statusCode;
  }
}
