import { Effect } from "effect"
import type { AgentGateway, AgentConfig, AgentCommandResult } from "./agent-gateway"
import { AGENTS_INFO } from "./agent-gateway"

export class HermesConnector implements AgentGateway {
  readonly info = AGENTS_INFO.hermes
  readonly config: AgentConfig

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = { ...config, type: "hermes" }
  }

  execute(command: string): Effect.Effect<AgentCommandResult> {
    return Effect.gen(function* () {
      const hermesPath = this.config.url ?? "hermes"
      const spawn = Bun.spawn([hermesPath, "chat", "-q", command], {
        stdio: ["ignore", "pipe", "pipe"],
      })

      const output = yield* Effect.promise(() => new Response(spawn.stdout).text())
      const exitCode = yield* Effect.promise(() => spawn.exited)

      if (exitCode !== 0) {
        const stderr = yield* Effect.promise(() => new Response(spawn.stderr).text())
        return {
          output: `Hermes agent error (exit ${exitCode}): ${stderr || output}`,
          metadata: { exitCode },
        } satisfies AgentCommandResult
      }

      return { output, metadata: { exitCode } } satisfies AgentCommandResult
    })
  }

  health(): Effect.Effect<boolean> {
    return Effect.gen(function* () {
      const hermesPath = this.config.url ?? "hermes"
      const spawn = Bun.spawn([hermesPath, "--version"], {
        stdio: ["ignore", "pipe", "pipe"],
      })
      const exitCode = yield* Effect.promise(() => spawn.exited)
      return exitCode === 0
    }).pipe(Effect.catchAll(() => Effect.succeed(false)))
  }
}
