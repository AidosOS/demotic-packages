import { Effect } from "effect"

export type AgentType = "clisis" | "hermes" | "openclaw"

export type AgentCapability =
  | "system"       // System operations, file management, Docker, shell (Clisis)
  | "reasoning"    // Complex reasoning, multi-turn, creative (Hermes)
  | "messaging"    // Multi-channel communication, plugins, gateway (OpenClaw)
  | "coding"       // Code generation, editing, project scaffolding (All)
  | "security"     // Pentest, scanning, network recon (Clisis)
  | "research"     // Web search, deep research, information gathering (Hermes)
  | "orchestrate"  // Multi-platform orchestration, channel bridging (OpenClaw)

export interface AgentConfig {
  type: AgentType
  url?: string
  port?: number
  token?: string
  timeout?: number
}

export interface AgentInfo {
  type: AgentType
  name: string
  description: string
  capabilities: AgentCapability[]
  runtime: "deno" | "python" | "node"
  protocol: "a2a" | "cli" | "http"
  defaultPort: number
}

export interface AgentCommandResult {
  output: string
  metadata?: Record<string, unknown>
}

export interface AgentGateway {
  readonly info: AgentInfo
  readonly config: AgentConfig
  execute(command: string, ctx?: { signal?: AbortSignal }): Effect.Effect<AgentCommandResult>
  health(): Effect.Effect<boolean>
}

export const AGENTS_INFO: Record<AgentType, AgentInfo> = {
  clisis: {
    type: "clisis",
    name: "Clisis Agent",
    description: "Deno system operator — hardware control, file management, Docker sandbox, pentest, edge computing",
    capabilities: ["system", "security", "coding"],
    runtime: "deno",
    protocol: "a2a",
    defaultPort: 18792,
  },
  hermes: {
    type: "hermes",
    name: "Hermes Agent",
    description: "Python self-improving agent — complex reasoning, skill extraction, web research, multi-turn conversations",
    capabilities: ["reasoning", "research", "coding"],
    runtime: "python",
    protocol: "cli",
    defaultPort: 18793,
  },
  openclaw: {
    type: "openclaw",
    name: "OpenClaw Agent",
    description: "Node multi-channel gateway — plugin orchestration, multi-platform messaging, file parsing at scale",
    capabilities: ["messaging", "orchestrate", "coding"],
    runtime: "node",
    protocol: "http",
    defaultPort: 18794,
  },
}

export const DEFAULT_PORTS: Record<AgentType, number> = {
  clisis: 18792,
  hermes: 18793,
  openclaw: 18794,
}
