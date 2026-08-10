// @ts-nocheck

import { clisisCoder } from "@demotic/clisis-core"
import { ReadTool } from "@demotic/clisis-core/tools"

const clisisCoder = ClisisCoder.make({})

ClisisCoder.tool.add(ReadTool)

ClisisCoder.tool.add({
  name: "bash",
  schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to run.",
      },
    },
    required: ["command"],
  },
  execute(input, ctx) {},
})

ClisisCoder.auth.add({
  provider: "openai",
  type: "api",
  value: process.env.OPENAI_API_KEY,
})

ClisisCoder.agent.add({
  name: "build",
  permissions: [],
  model: {
    id: "gpt-5-5",
    provider: "openai",
    variant: "xhigh",
  },
})

const sessionID = await ClisisCoder.session.create({
  agent: "build",
})

ClisisCoder.subscribe((event) => {
  console.log(event)
})

await ClisisCoder.session.prompt({
  sessionID,
  text: "hey what is up",
})

await ClisisCoder.session.prompt({
  sessionID,
  text: "what is up with this",
  files: [
    {
      mime: "image/png",
      uri: "data:image/png;base64,xxxx",
    },
  ],
})

await ClisisCoder.session.wait()

console.log(await ClisisCoder.session.messages(sessionID))
