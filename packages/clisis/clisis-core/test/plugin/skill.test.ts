import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { AgentV2 } from "@demotic/clisis-core/agent"
import { FSUtil } from "@demotic/clisis-core/fs-util"
import { SkillPlugin } from "@demotic/clisis-core/plugin/skill"
import { SkillV2 } from "@demotic/clisis-core/skill"
import { SkillDiscovery } from "@demotic/clisis-core/skill/discovery"
import { testEffect } from "../lib/effect"

const it = testEffect(
  SkillV2.layer.pipe(
    Layer.provide(FSUtil.defaultLayer),
    Layer.provide(SkillDiscovery.defaultLayer),
    Layer.provideMerge(AgentV2.locationLayer),
  ),
)

describe("SkillPlugin.Plugin", () => {
  it.effect("registers the built-in customize-clisisCoder skill", () =>
    Effect.gen(function* () {
      const skill = yield* SkillV2.Service
      yield* SkillPlugin.Plugin.effect.pipe(Effect.provideService(SkillV2.Service, skill))

      expect(yield* skill.list()).toContainEqual(
        expect.objectContaining({
          name: "customize-clisisCoder",
          description: expect.stringContaining("clisisCoder's own configuration"),
        }),
      )
    }),
  )
})
