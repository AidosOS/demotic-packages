import { Config, ConfigProvider, Context, Effect, Layer, Option } from "effect"
import { ConfigService } from "@/effect/config-service"

const bool = (name: string) => Config.boolean(name).pipe(Config.withDefault(false))
const positiveInteger = (name: string) =>
  Config.number(name).pipe(
    Config.map((value) => (Number.isInteger(value) && value > 0 ? value : undefined)),
    Config.orElse(() => Config.succeed(undefined)),
  )
const experimental = bool("CLISIS_CODER_EXPERIMENTAL")
const enabledByExperimental = (name: string) =>
  Config.all({ experimental, enabled: Config.boolean(name).pipe(Config.option) }).pipe(
    Config.map((flags) => Option.getOrElse(flags.enabled, () => flags.experimental)),
  )

export class Service extends ConfigService.Service<Service>()("@demotic/clisis-RuntimeFlags", {
  autoShare: bool("CLISIS_CODER_AUTO_SHARE"),
  pure: bool("CLISIS_CODER_PURE"),
  disableDefaultPlugins: bool("CLISIS_CODER_DISABLE_DEFAULT_PLUGINS"),
  disableEmbeddedWebUi: bool("CLISIS_CODER_DISABLE_EMBEDDED_WEB_UI"),
  disableExternalSkills: bool("CLISIS_CODER_DISABLE_EXTERNAL_SKILLS"),
  disableLspDownload: bool("CLISIS_CODER_DISABLE_LSP_DOWNLOAD"),
  disableClaudeCodePrompt: Config.all({
    broad: bool("CLISIS_CODER_DISABLE_CLAUDE_CODE"),
    direct: bool("CLISIS_CODER_DISABLE_CLAUDE_CODE_PROMPT"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  disableClaudeCodeSkills: Config.all({
    broad: bool("CLISIS_CODER_DISABLE_CLAUDE_CODE"),
    direct: bool("CLISIS_CODER_DISABLE_CLAUDE_CODE_SKILLS"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  enableExa: Config.all({
    experimental,
    enabled: bool("CLISIS_CODER_ENABLE_EXA"),
    legacy: bool("CLISIS_CODER_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("CLISIS_CODER_ENABLE_PARALLEL"),
    legacy: bool("CLISIS_CODER_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableExperimentalModels: bool("CLISIS_CODER_ENABLE_EXPERIMENTAL_MODELS"),
  enableQuestionTool: bool("CLISIS_CODER_ENABLE_QUESTION_TOOL"),
  experimentalReferences: enabledByExperimental("CLISIS_CODER_EXPERIMENTAL_REFERENCES"),
  experimentalBackgroundSubagents: enabledByExperimental("CLISIS_CODER_EXPERIMENTAL_BACKGROUND_SUBAGENTS"),
  experimentalLspTy: bool("CLISIS_CODER_EXPERIMENTAL_LSP_TY"),
  experimentalLspTool: enabledByExperimental("CLISIS_CODER_EXPERIMENTAL_LSP_TOOL"),
  experimentalOxfmt: enabledByExperimental("CLISIS_CODER_EXPERIMENTAL_OXFMT"),
  experimentalPlanMode: enabledByExperimental("CLISIS_CODER_EXPERIMENTAL_PLAN_MODE"),
  experimentalEventSystem: enabledByExperimental("CLISIS_CODER_EXPERIMENTAL_EVENT_SYSTEM"),
  experimentalWorkspaces: enabledByExperimental("CLISIS_CODER_EXPERIMENTAL_WORKSPACES"),
  experimentalIconDiscovery: enabledByExperimental("CLISIS_CODER_EXPERIMENTAL_ICON_DISCOVERY"),
  outputTokenMax: positiveInteger("CLISIS_CODER_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  bashDefaultTimeoutMs: positiveInteger("CLISIS_CODER_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  experimentalNativeLlm: bool("CLISIS_CODER_EXPERIMENTAL_NATIVE_LLM"),
  experimentalWebSockets: bool("CLISIS_CODER_EXPERIMENTAL_WEBSOCKETS"),
  client: Config.string("CLISIS_CODER_CLIENT").pipe(Config.withDefault("cli")),
}) {}

export type Info = Context.Service.Shape<typeof Service>

const emptyConfigLayer = Service.defaultLayer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
  Layer.orDie,
)

export const layer = (overrides: Partial<Info> = {}) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const flags = yield* Service
      return Service.of({ ...flags, ...overrides })
    }),
  ).pipe(Layer.provide(emptyConfigLayer))

export const defaultLayer = Service.defaultLayer.pipe(Layer.orDie)

export * as RuntimeFlags from "./runtime-flags"
