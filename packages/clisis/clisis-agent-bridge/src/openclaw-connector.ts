import { Effect } from "effect"
import type { AgentGateway, AgentConfig, AgentCommandResult } from "./agent-gateway"
import { AGENTS_INFO } from "./agent-gateway"

const HTTP_URL_DEFAULT = "http://localhost:18794"

export class OpenClawConnector implements AgentGateway {
  readonly info = AGENTS_INFO.openclaw
  readonly config: AgentConfig

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = { ...config, type: "openclaw" }
  }

  execute(command: string): Effect.Effect<AgentCommandResult> {
    return Effect.gen(function* () {
      const baseUrl = this.config.url ?? HTTP_URL_DEFAULT
      const token = this.config.token

      const response = yield* Effect.promise(() =>
        fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            model: "openclaw-agent",
            messages: [{ role: "user", content: command }],
            stream: false,
          }),
        }),
      )

      if (!response.ok) {
        const body = yield* Effect.promise(() => response.text())
        return {
          output: `OpenClaw agent error (${response.status}): ${body}`,
          metadata: { status: response.status, url: baseUrl },
        } satisfies AgentCommandResult
      }

      const data = yield* Effect.promise(() => response.json())
      const result = data?.choices?.[0]?.message?.content ?? JSON.stringify(data)

      return { output: result, metadata: { url: baseUrl } } satisfies AgentCommandResult
    })
  }

  health(): Effect.Effect<boolean> {
    return Effect.gen(function* () {
      const baseUrl = this.config.url ?? HTTP_URL_DEFAULT
      const response = yield* Effect.promise(() => fetch(`${baseUrl}/v1/models`, { signal: AbortSignal.timeout(3000) }))
      return response.ok
    }).pipe(Effect.catchAll(() => Effect.succeed(false)))
  }
}
