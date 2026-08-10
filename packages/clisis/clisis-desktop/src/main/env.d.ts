interface ImportMetaEnv {
  readonly CLISIS_CODER_CHANNEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "virtual:ClisisCoder-server" {
  export namespace Server {
    export const listen: typeof import("../../../clisisCoder/dist/types/src/node").Server.listen
    export type Listener = import("../../../clisisCoder/dist/types/src/node").Server.Listener
  }
  export namespace Config {
    export const get: typeof import("../../../clisisCoder/dist/types/src/node").Config.get
    export type Info = import("../../../clisisCoder/dist/types/src/node").Config.Info
  }
  export namespace Log {
    export const init: typeof import("../../../clisisCoder/dist/types/src/node").Log.init
  }
  export const bootstrap: typeof import("../../../clisisCoder/dist/types/src/node").bootstrap
}
