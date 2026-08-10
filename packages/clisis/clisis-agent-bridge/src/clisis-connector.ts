import { Effect } from "effect"
import type { AgentGateway, AgentConfig, AgentCommandResult } from "./agent-gateway"
import { AGENTS_INFO } from "./agent-gateway"

const WS_URL_DEFAULT = "ws://localhost:18792"

export class ClisisConnector implements AgentGateway {
  readonly info = AGENTS_INFO.clisis
  readonly config: AgentConfig

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = { ...config, type: "clisis" }
  }

  execute(command: string): Effect.Effect<AgentCommandResult> {
    return Effect.gen(function* () {
      const url = `${this.config.url ?? WS_URL_DEFAULT}/a2a`
      const token = this.config.token

      const response = yield* Effect.promise(() =>
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "tasks/send",
            params: {
              id: crypto.randomUUID(),
              sessionId: crypto.randomUUID(),
              message: {
                role: "user",
                content: [{ type: "text", text: command }],
              },
            },
          }),
        }),
      )

      if (!response.ok) {
        const body = yield* Effect.promise(() => response.text())
        return {
          output: `Clisis agent error (${response.status}): ${body}`,
          metadata: { status: response.status, url },
        } satisfies AgentCommandResult
      }

      const data = yield* Effect.promise(() => response.json())
      const result = data?.result?.message?.content
        ?.map((part: { text?: string }) => part.text ?? "")
        .filter(Boolean)
        .join("\n") ?? JSON.stringify(data)

      return { output: result, metadata: { url } } satisfies AgentCommandResult
    })
  }

  health(): Effect.Effect<boolean> {
    return Effect.gen(function* () {
      const url = `${this.config.url ?? WS_URL_DEFAULT}/health`
      const response = yield* Effect.promise(() => fetch(url, { signal: AbortSignal.timeout(3000) }))
      return response.ok
    }).pipe(Effect.catchAll(() => Effect.succeed(false)))
  }
}
