import type { WslclisisCoderCheck, WslServerRuntime } from "./types"

export const wslRuntimeRetryable = (runtime: WslServerRuntime) =>
  runtime.kind === "failed" || runtime.kind === "stopped"

export async function enterWslclisisCoderStep(
  distro: string,
  probe: (distro: string) => Promise<unknown>,
  select: (step: "clisisCoder") => void,
) {
  await probe(distro)
  select("clisisCoder")
}

export function wslclisisCoderAction(check?: WslclisisCoderCheck) {
  if (!check) return
  if (!check.resolvedPath) return "Install clisisCoder"
  if (check.matchesDesktop === false) return "Update clisisCoder"
}
