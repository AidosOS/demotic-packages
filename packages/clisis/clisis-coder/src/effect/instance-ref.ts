import { Context } from "effect"
import type { InstanceContext } from "@/project/instance-context"
import type { WorkspaceV2 } from "@demotic/clisis-core/workspace"

export const InstanceRef = Context.Reference<InstanceContext | undefined>("~clisisCoder/InstanceRef", {
  defaultValue: () => undefined,
})

export const WorkspaceRef = Context.Reference<WorkspaceV2.ID | undefined>("~clisisCoder/WorkspaceRef", {
  defaultValue: () => undefined,
})
