import { onMount, onCleanup } from "solid-js"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import "xterm/css/xterm.css"

interface TerminalViewProps {
  ptyId: string
  onData: (data: string) => void
  onResize: (cols: number, rows: number) => void
}

export function TerminalView(props: TerminalViewProps) {
  let containerRef: HTMLDivElement | undefined

  onMount(() => {
    if (!containerRef) return

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: 14,
      fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
      theme: {
        background: "#0a0e14",
        foreground: "#e6edf3",
        cursor: "#58a6ff",
        selectionBackground: "#264f78",
        black: "#0a0e14",
        red: "#ff3333",
        green: "#3fb950",
        yellow: "#d29922",
        blue: "#58a6ff",
        magenta: "#bc8cff",
        cyan: "#39c5cf",
        white: "#e6edf3",
        brightBlack: "#484f58",
        brightRed: "#ff6b6b",
        brightGreen: "#56d364",
        brightYellow: "#d29922",
        brightBlue: "#79c0ff",
        brightMagenta: "#bc8cff",
        brightCyan: "#39c5cf",
        brightWhite: "#ffffff",
      },
      allowTransparency: true,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    term.open(containerRef)
    fitAddon.fit()

    term.onData((data) => {
      props.onData(data)
    })

    term.onResize(({ cols, rows }) => {
      props.onResize(cols, rows)
    })

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit()
    })
    resizeObserver.observe(containerRef)

    onCleanup(() => {
      resizeObserver.disconnect()
      term.dispose()
    })
  })

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        background: "#0a0e14",
      }}
    />
  )
}
