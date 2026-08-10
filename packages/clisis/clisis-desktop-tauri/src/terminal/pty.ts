import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"

export type PtyOutputCallback = (data: string) => void

const listeners = new Map<string, () => void>()

export async function createPtySession(
  id: string,
  rows: number,
  cols: number,
  cwd?: string,
): Promise<void> {
  await invoke("pty_create", { id, rows, cols, cwd })
}

export async function writePty(id: string, data: string): Promise<void> {
  await invoke("pty_write", { id, data })
}

export async function resizePty(
  id: string,
  cols: number,
  rows: number,
): Promise<void> {
  await invoke("pty_resize", { id, rows, cols })
}

export async function killPty(id: string): Promise<void> {
  await invoke("pty_kill", { id })
  const unlisten = listeners.get(id)
  if (unlisten) {
    unlisten()
    listeners.delete(id)
  }
}

export async function onPtyOutput(
  id: string,
  callback: PtyOutputCallback,
): Promise<void> {
  const unlisten = await listen<string>(`pty-output-${id}`, (event) => {
    callback(event.payload)
  })
  listeners.set(id, unlisten)
}
