import { Context, Effect, Layer } from "effect"
import type { AgentType, AgentCapability, AgentInfo, AgentCommandResult } from "./agent-gateway"
import { ClisisConnector } from "./clisis-connector"
import { HermesConnector } from "./hermes-connector"
import { OpenClawConnector } from "./openclaw-connector"

export interface AgentStatus {
  type: AgentType
  info: AgentInfo
  healthy: boolean
}

export interface AgentSelectorInput {
  task: string
  preferredCapabilities?: AgentCapability[]
}

export interface Interface {
  readonly all: () => Effect.Effect<AgentGateway[]>
  readonly healthy: () => Effect.Effect<AgentGateway[]>
  readonly byType: (type: AgentType) => Effect.Effect<AgentGateway, AgentNotFound>
  readonly byCapability: (capability: AgentCapability) => Effect.Effect<AgentGateway[], NoAgentAvailable>
  readonly status: () => Effect.Effect<AgentStatus[]>
  readonly healthCheck: () => Effect.Effect<AgentStatus[]>
  readonly select: (input: AgentSelectorInput) => Effect.Effect<AgentGateway, NoAgentAvailable>
  readonly execute: (type: AgentType, command: string, ctx?: { signal?: AbortSignal }) => Effect.Effect<AgentCommandResult>
}

export class AgentNotFound extends Error {
  readonly _tag = "AgentNotFound"
  constructor(readonly type: AgentType) {
    super(`Agent '${type}' not found in the gateway registry`)
  }
}

export class NoAgentAvailable extends Error {
  readonly _tag = "NoAgentAvailable"
  constructor(message: string) {
    super(message)
  }
}

export class Service extends Context.Tag("@demotic/clisis-AgentGatewayRuntime")<
  Service,
  Interface
>() {}

const ALL_TYPES: AgentType[] = ["clisis", "hermes", "openclaw"]

const gatewayInstance = (type: AgentType): AgentGateway => {
  switch (type) {
    case "clisis": return new ClisisConnector() as AgentGateway
    case "hermes": return new HermesConnector() as AgentGateway
    case "openclaw": return new OpenClawConnector() as AgentGateway
  }
}

export const layer: Layer.Layer<Service> = Layer.effect(
  Service,
  Effect.gen(function* () {
    const gateways = ALL_TYPES.map(gatewayInstance)

    const healthCheck: Interface["healthCheck"] = Effect.fn("AgentGatewayRuntime.healthCheck")(function* () {
      const results = yield* Effect.forEach(gateways, (g: AgentGateway) =>
        Effect.gen(function* () {
          const healthy = yield* g.health()
          return { type: g.info.type, info: g.info, healthy } satisfies AgentStatus
        }),
      )
      return results
    })

    const all: Interface["all"] = Effect.succeed(gateways)

    const healthy: Interface["healthy"] = Effect.fn("AgentGatewayRuntime.healthy")(function* () {
      const statuses = yield* healthCheck()
      return gateways.filter((g: AgentGateway) => statuses.find((s: AgentStatus) => s.type === g.info.type)?.healthy)
    })

    const byType: Interface["byType"] = Effect.fn("AgentGatewayRuntime.byType")(function* (type: AgentType) {
      const found = gateways.find((g: AgentGateway) => g.info.type === type)
      if (!found) return yield* Effect.fail(new AgentNotFound(type))
      return found
    })

    const status: Interface["status"] = Effect.fn("AgentGatewayRuntime.status")(function* () {
      return yield* healthCheck()
    })

    const byCapability: Interface["byCapability"] = Effect.fn("AgentGatewayRuntime.byCapability")(function* (capability: AgentCapability) {
      const candidates = gateways.filter((g: AgentGateway) => g.info.capabilities.includes(capability))
      if (candidates.length === 0) {
        return yield* Effect.fail(new NoAgentAvailable(`No agent available with capability: ${capability}`))
      }
      const statuses = yield* healthCheck()
      const available = candidates.filter((g: AgentGateway) => statuses.find((s: AgentStatus) => s.type === g.info.type)?.healthy)
      if (available.length === 0) {
        return yield* Effect.fail(new NoAgentAvailable(`No healthy agent with capability: ${capability}`))
      }
      return available
    })

    const select: Interface["select"] = Effect.fn("AgentGatewayRuntime.select")(function* (input: AgentSelectorInput) {
      const { preferredCapabilities, task } = input
      const statuses = yield* healthCheck()
      const available = gateways.filter((g: AgentGateway) => statuses.find((s: AgentStatus) => s.type === g.info.type)?.healthy)
      if (available.length === 0) {
        return yield* Effect.fail(new NoAgentAvailable("No healthy agents available"))
      }

      if (preferredCapabilities && preferredCapabilities.length > 0) {
        for (const cap of preferredCapabilities) {
          const match = available.find((g: AgentGateway) => g.info.capabilities.includes(cap))
          if (match) return match
        }
      }

      const taskLower = task.toLowerCase()
      const keywords: Record<AgentType, RegExp[]> = {
        clisis: [/file|system|shell|docker|container|terminal|command|install|scan|pentest|network|backup/],
        hermes: [/research|search|reason|analyze|explain|think|write|create|skill|learn|web/],
        openclaw: [/message|channel|plugin|bridge|gateway|communicate|send|notify|parse|transform|convert/],
      }

      for (const [type, patterns] of Object.entries(keywords)) {
        if (patterns.some((p: RegExp) => p.test(taskLower))) {
          const match = available.find((g: AgentGateway) => g.info.type === type)
          if (match) return match
        }
      }

      return available[0]
    })

    const execute: Interface["execute"] = Effect.fn("AgentGatewayRuntime.execute")(function* (type: AgentType, command: string, ctx?: { signal?: AbortSignal }) {
      const gateway = yield* byType(type)
      return yield* gateway.execute(command, ctx)
    })

    return Service.of({ all, healthy, byType, byCapability, status, healthCheck, select, execute })
  }),
)

interface AgentGateway {
  info: AgentInfo
  health(): Effect.Effect<boolean>
  execute(command: string, ctx?: { signal?: AbortSignal }): Effect.Effect<AgentCommandResult>
}


