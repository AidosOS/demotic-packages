import { createSignal, onMount } from "solid-js"
import { TerminalView } from "./terminal/Terminal"
import { createPtySession, writePty, resizePty, killPty } from "./terminal/pty"
import { getPlatformInfo } from "./platform"

export default function App() {
  const [status, setStatus] = createSignal("initializing")
  const [ptyId] = createSignal(`pty-${Date.now()}`)

  onMount(async () => {
    try {
      const info = await getPlatformInfo()
      console.log("Platform:", info)

      await createPtySession(ptyId(), 24, 80)

      setStatus("ready")
    } catch (err) {
      console.error("Failed to initialize:", err)
      setStatus("error")
    }
  })

  const onTerminalData = (data: string) => {
    writePty(ptyId(), data)
  }

  const onTerminalResize = (cols: number, rows: number) => {
    resizePty(ptyId(), cols, rows)
  }

  return (
    <div class="app">
      <div class="app-header">
        <span class="app-title">Clisis Coder</span>
        <span class="app-status">{status()}</span>
      </div>
      <div class="app-body">
        <TerminalView
          ptyId={ptyId()}
          onData={onTerminalData}
          onResize={onTerminalResize}
        />
      </div>
    </div>
  )
}
