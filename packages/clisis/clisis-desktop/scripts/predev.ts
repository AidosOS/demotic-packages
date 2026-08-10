import { $ } from "bun"

await $`bun ./scripts/copy-icons.ts ${process.env.CLISIS_CODER_CHANNEL ?? "dev"}`

await $`cd ../clisis-coder && bun script/build-node.ts`
