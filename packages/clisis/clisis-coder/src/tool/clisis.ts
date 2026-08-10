import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import { ClisisConnector } from "@demotic/clisis-agent-bridge"

export const Parameters = Schema.Struct({
  command: Schema.String.annotate({ description: "The command or task to send to the Clisis agent (Deno system operator — hardware control, file management, Docker sandbox, pentest)" }),
})

const connector = new ClisisConnector()

export const ClisisTool = Tool.define(
  "clisis",
  Effect.gen(function* () {
    return {
      description:
        "Execute a command via the Clisis A2A agent (WebSocket protocol). Use for system operations, file management, Docker sandbox, and shell tasks.",
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>) =>
        Effect.gen(function* () {
          const result = yield* connector.execute(params.command)
          return {
            output: result.output,
            title: `Clisis: ${params.command.slice(0, 60)}`,
            metadata: result.metadata ?? {},
          }
        }),
    }
  }),
)
