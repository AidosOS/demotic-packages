import { type ComponentProps } from "solid-js"

export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 4 L4 10 L7 16" stroke="var(--icon-strong-base)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 4 L12 10 L9 16" stroke="var(--icon-strong-base)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="7" y="9" width="2" height="2" rx="0.5" fill="var(--icon-weak-base)" opacity="0.4"/>
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M36 24 L24 40 L24 60 L36 76" stroke="var(--icon-strong-base)" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M44 24 L56 40 L56 60 L44 76" stroke="var(--icon-strong-base)" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="35" y="43" width="10" height="14" rx="3" fill="var(--icon-base)" opacity="0.25"/>
    </svg>
  )
}

export const Logo = (props: { class?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 234 42"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g>
        <path d="M31 12 L22 21 L22 33 L31 42" stroke="var(--icon-base)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M49 12 L58 21 L58 33 L49 42" stroke="var(--icon-base)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="35.5" y="24.5" width="9" height="9" rx="1.5" fill="var(--icon-weak-base)" opacity="0.25"/>
        <text x="80" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="var(--icon-strong-base)" letter-spacing="1.5">clisis coder</text>
      </g>
    </svg>
  )
}
