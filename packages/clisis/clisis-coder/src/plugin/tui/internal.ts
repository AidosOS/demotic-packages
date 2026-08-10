import { Flag } from "@demotic/clisis-core/flag/flag"
import { createBuiltinPlugins, type BuiltinTuiPlugin } from "@demotic/clisis-tui/builtins"
import type { RuntimeFlags } from "@/effect/runtime-flags"

export type InternalTuiPlugin = BuiltinTuiPlugin

export function internalTuiPlugins(flags: Pick<RuntimeFlags.Info, "experimentalEventSystem">): InternalTuiPlugin[] {
  return createBuiltinPlugins({
    experimentalEventSystem: flags.experimentalEventSystem,
    experimentalSessionSwitcher: Flag.CLISIS_CODER_EXPERIMENTAL_SESSION_SWITCHER,
  })
}
