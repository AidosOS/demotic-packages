# Clisis Coder Desktop (Tauri v2)

This package provides a Tauri v2 desktop shell for Clisis Coder with a native PTY terminal backend.

## Architecture

```
src-tauri/           (Rust backend)
  src/
    main.rs          Entry point (windows_subsystem)
    lib.rs           Tauri plugin setup, command handler registration
    commands.rs      IPC commands exposed to JS
    pty.rs           portable-pty session management + event emission
    sidecar.rs       Clisis Coder server process lifecycle
    platform/
      mod.rs         OS info helpers
  Cargo.toml         Rust dependencies
  tauri.conf.json    Window config, build commands, CSP
  capabilities/
    default.json     Permission grants

src/                 (SolidJS frontend)
  index.html         Entry HTML
  index.tsx          SolidJS render mount
  App.tsx            Main app shell (header + terminal)
  styles.css         Dark theme (GitHub Dark inspired)
  env.d.ts           Vite client type declarations
  terminal/
    Terminal.tsx     xterm.js wrapper with FitAddon
    pty.ts           Tauri IPC bridge for PTY commands + events
  platform/
    index.ts         Platform adapter (dialog, notification, store)
```

## Backend (Rust/Tauri)

- **PTY**: Uses `portable-pty` crate for cross-platform PTY management
  - Each PTY session spawns a reader thread that emits `pty-output-{id}` events to the webview
  - Input flows: JS `invoke("pty_write")` → Rust → PTY master fd → child shell
  - Output flows: PTY master output → reader thread → Tauri event → JS listener → xterm.js `write()`
- **Sidecar**: `tauri-plugin-shell` spawns the `Clisis Coder` Node.js server as a child process
  - Health check polling on `/global/health` with 30s timeout
  - Optional port auto-selection (port 0 = find free port)
- **Plugins**: shell, dialog, fs, notification, process, store, updater

## Frontend (SolidJS + xterm.js)

- Reuses no existing UI components yet (import from `@demotic/clisis-ui` once available)
- Dark terminal theme matching GitHub Dark color scheme
- xterm.js with FitAddon for auto-resize
- Platform adapter wraps Tauri plugins: dialog, notification, key-value store

## IPC Commands

| Command | Parameters | Description |
|---------|-----------|-------------|
| `start_Clisis Coder_server` | `port?: u16` | Start Clisis Coder server sidecar |
| `stop_Clisis Coder_server` | — | Kill Clisis Coder server |
| `get_server_status` | — | Query server running state |
| `pty_create` | `id, rows, cols, cwd?` | Create PTY session |
| `pty_write` | `id, data` | Write to PTY stdin |
| `pty_resize` | `id, rows, cols` | Resize PTY |
| `pty_kill` | `id` | Kill PTY session |
| `get_platform_info` | — | OS, arch, hostname |
| `open_link` | `url` | Open URL in default browser |
| `show_notification` | `title, body` | Show OS notification |

## Development

```bash
cd packages/desktop-tauri
bun install        # Install JS deps
cargo build        # Check Rust compiles
bun run dev        # Start Tauri dev server (requires bun install)
```

### Requirements
- Rust 1.78+ with `wasm32-unknown-unknown` target
- Tauri v2 CLI (`cargo install tauri-cli --version "^2"`)
- Node.js 20+ / Bun for JS deps
- Windows: WebView2 (included in Win10+)

## Known Issues
- `bun install` is blocked on this machine (network/Windows); deps not installed
- TypeScript typecheck unavailable (`tsgo` not installed)
- `portable-pty` requires a C compiler on first build
- Plugin `shell:allow-spawn` requires exact cmd path in production builds
