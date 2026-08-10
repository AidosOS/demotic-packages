import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import { HermesConnector } from "@demotic/clisis-agent-bridge"

export const Parameters = Schema.Struct({
  command: Schema.String.annotate({ description: "The prompt or task to send to the Hermes agent (Python self-improving agent — complex reasoning, skill extraction, research)" }),
})

const connector = new HermesConnector()

export const HermesTool = Tool.define(
  "hermes",
  Effect.gen(function* () {
    return {
      description:
        "Execute a command via the Hermes self-improving agent (CLI/ACP). Use for complex reasoning, multi-turn conversations, web research, and creative tasks.",
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>) =>
        Effect.gen(function* () {
          const result = yield* connector.execute(params.command)
          return {
            output: result.output,
            title: `Hermes: ${params.command.slice(0, 60)}`,
            metadata: result.metadata ?? {},
          }
        }),
    }
  }),
)
