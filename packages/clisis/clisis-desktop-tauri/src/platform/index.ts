import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification"
import { Store } from "@tauri-apps/plugin-store"

export interface PlatformInfo {
  os: string
  arch: string
  hostname: string
}

export async function getPlatformInfo(): Promise<PlatformInfo> {
  return invoke<PlatformInfo>("get_platform_info")
}

export async function openFileDialog(options?: {
  multiple?: boolean
  filters?: { name: string; extensions: string[] }[]
}): Promise<string | string[] | null> {
  return open(options)
}

export async function notify(title: string, body: string): Promise<void> {
  let granted = await isPermissionGranted()
  if (!granted) {
    const permission = await requestPermission()
    granted = permission === "granted"
  }
  if (granted) {
    sendNotification({ title, body })
  }
}

let appStore: Store | null = null

export async function getStore(): Promise<Store> {
  if (!appStore) {
    appStore = await Store.load("settings.json")
  }
  return appStore
}

export async function getSetting<T>(key: string, defaultValue?: T): Promise<T | undefined> {
  const store = await getStore()
  return store.get<T>(key) ?? defaultValue
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const store = await getStore()
  await store.set(key, value)
  await store.save()
}
