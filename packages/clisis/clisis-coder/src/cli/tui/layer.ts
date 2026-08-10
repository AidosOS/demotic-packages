import { run as runTui, type TuiInput } from "@demotic/clisis-tui"
import { Global } from "@demotic/clisis-core/global"
import { Effect } from "effect"

export function run(input: TuiInput) {
  return runTui(input).pipe(Effect.provide(Global.defaultLayer))
}
