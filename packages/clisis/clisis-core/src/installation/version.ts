declare global {
  const CLISIS_CODER_VERSION: string
  const CLISIS_CODER_CHANNEL: string
}

export const InstallationVersion = typeof CLISIS_CODER_VERSION === "string" ? CLISIS_CODER_VERSION : "local"
export const InstallationChannel = typeof CLISIS_CODER_CHANNEL === "string" ? CLISIS_CODER_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
