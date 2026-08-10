import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import { OpenClawConnector } from "@demotic/clisis-agent-bridge"

export const Parameters = Schema.Struct({
  command: Schema.String.annotate({ description: "The prompt or task to send to the OpenClaw agent (Node multi-channel gateway — plugin orchestration, multi-platform messaging, file parsing)" }),
})

const connector = new OpenClawConnector()

export const OpenClawTool = Tool.define(
  "openclaw",
  Effect.gen(function* () {
    return {
      description:
        "Execute a command via the OpenClaw multi-channel agent (HTTP API). Use for multi-channel communication, plugin orchestration, and gateway tasks.",
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>) =>
        Effect.gen(function* () {
          const result = yield* connector.execute(params.command)
          return {
            output: result.output,
            title: `OpenClaw: ${params.command.slice(0, 60)}`,
            metadata: result.metadata ?? {},
          }
        }),
    }
  }),
)
