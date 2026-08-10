export * from "./client.js"
export * from "./server.js"

import { createClisisCoderClient } from "./client.js"
import { createClisisCoderServer } from "./server.js"
import type { ServerOptions } from "./server.js"

export * as data from "./data.js"

export async function createClisisCoder(options?: ServerOptions) {
  const server = await createClisisCoderServer({
    ...options,
  })

  const client = createClisisCoderClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
