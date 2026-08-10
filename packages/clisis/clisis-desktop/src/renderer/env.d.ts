import type { ElectronAPI } from "../preload/types"

declare global {
  interface Window {
    api: ElectronAPI
    __CLISIS_CODER__?: {
      deepLinks?: string[]
    }
  }
}
