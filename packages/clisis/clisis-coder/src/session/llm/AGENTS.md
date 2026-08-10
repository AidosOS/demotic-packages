# Session LLM Runtime Boundaries

`../llm.ts` is the Clisis Coder session LLM service. It owns Clisis Coder concerns: auth, config, model/provider resolution, plugins, permissions, telemetry headers, and runtime selection. It is the only file in this area that should know about the full session request shape.

This folder contains adapters behind that service boundary:

- `ai-sdk.ts` converts AI SDK `fullStream` parts into `@demotic/clisis-llm` `LLMEvent`s. This is the default runtime path.
- `native-request.ts` converts Clisis Coder's normalized session input into a native `@demotic/clisis-llm` `LLMRequest`. It does not execute requests.
- `native-runtime.ts` is the opt-in native runtime adapter. It decides whether a selected model is supported, builds the native request, bridges Clisis Coder tools into native executable tools, and delegates transport to `LLMClient` / `RequestExecutor`.

## File Structure

```txt
src/session/
  llm.ts                    session-owned orchestration and runtime selection
  llm/
    AGENTS.md               boundary notes for the adapter layer
    ai-sdk.ts               AI SDK fullStream -> @demotic/clisis-llm LLMEvent adapter
    native-request.ts       Clisis Coder/AI SDK-shaped input -> @demotic/clisis-llm LLMRequest
    native-runtime.ts       native runtime gate, tool bridge, and LLMClient handoff
```

Integration points:

- `../llm.ts` imports `LLMClient` from `@demotic/clisis-llm/route`; native execution is the only path that calls it directly.
- `../llm.ts` imports `LLMAISDK` from `./llm/ai-sdk`; the AI SDK path still calls `streamText(...)` locally, then adapts `result.fullStream` into shared `LLMEvent`s.
- `../llm.ts` imports `LLMNativeRuntime` from `./llm/native-runtime`; this is the runtime-selection seam. Unsupported native requests return a reason and fall back to AI SDK.
- `native-runtime.ts` imports `LLMNative` from `./native-request`; this keeps request lowering separate from transport and tool execution.
- `native-request.ts` is the only adapter file that should construct `LLM.request(...)`, `LLM.model(...)`, `Message.*`, `SystemPart`, `ToolCallPart`, `ToolResultPart`, or `ToolDefinition` values from `@demotic/clisis-llm`.
- `ai-sdk.ts` and `native-runtime.ts` both emit `@demotic/clisis-llm` `LLMEvent`s so downstream session processing does not care which runtime handled the request.

Keep new integration code on one of these seams. Avoid importing session services into `native-request.ts`; pass normalized data through `RequestInput` instead.

## Runtime selection

Both runtimes converge on the same `LLMEvent` stream consumed by the session processor. The gate is per-request: a single session can route some calls through native and fall back for others.

```txt
                             ╭───────────────────╮
╭───────────────────────────▶│ session processor │
│                            ╰─────────┬─────────╯
│                                      │
│                                      │
│                                      │
│                                      ▼
│                         ╭─────────────────────────╮
│                         │ LLM.Service (../llm.ts) │
│                         ╰────────────┬────────────╯
│                                      │
│                                      │
│                                      │
│                                      ▼
│                                ╭───────────╮
│                              ╭─╯           ╰─╮
│                              │  native gate  │
│                              ╰─╮           ╭─╯
│                                ╰─────┬─────╯
│                                      │
│                     ╭────── no ──────┴─────── yes ────────╮
│                     │                                     │
│                     ▼                                     ▼
│       ╭───────────────────────────╮             ╭───────────────────╮
│       │          AI SDK           │             │ native-runtime.ts │
│       │ streamText / generateText │             ╰────────┬──────────╯
│       ╰─────────────┬─────────────╯                      │
│                     │                                    │
│                 ╭───╯                                    │
│                 │                                        │
│                 ▼                                        ▼
│     ╭───────────────────────╮             ╭────────────────────────────╮
│     │       ai-sdk.ts       │             │     native-request.ts      │
│     │ fullStream → LLMEvent │             │ session input → LLMRequest │
│     ╰──────────┬────────────╯             ╰──────────────┬─────────────╯
│                │                                         │
│                │                                     ╭───╯
│                │                                     │
│                ▼                                     ▼
│       ╭─────────────────╮             ╭─────────────────────────────╮
╰───────┤ LLMEvent stream │◀────────────┤ LLMClient · RequestExecutor │
        ╰─────────────────╯             ╰─────────────────────────────╯
```

`native-runtime.ts` evaluates the gate and either bridges into `@demotic/clisis-llm` or returns control so `llm.ts` can take the AI SDK path. Tool execution stays Clisis Coder-owned in both branches; only request lowering and transport differ.

Safety boundary:

- AI SDK remains the default.
- `Clisis Coder_EXPERIMENTAL_NATIVE_LLM=true` or the umbrella `Clisis Coder_EXPERIMENTAL=true` opts in. Native is not a global replacement.
- Native execution currently supports OpenAI, Clisis Coder-managed OpenAI-compatible, and Anthropic API-key paths backed by `@ai-sdk/openai`, `@ai-sdk/openai-compatible`, or `@ai-sdk/anthropic` catalog entries.
- Unsupported providers, OpenAI OAuth, and missing API-key cases fall back to AI SDK.
