import { createUniqueId, type ComponentProps } from "solid-js"

export function WordmarkV2(props: Pick<ComponentProps<"svg">, "class">) {
  const filter = createUniqueId()
  const mask = createUniqueId()
  const maskGradient = createUniqueId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720.002 129.001"
      fill="none"
      preserveAspectRatio="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g opacity="0.16" filter={`url(#${filter})`} mask={`url(#${mask})`}>
        <path
          opacity="0.7"
          d="M320 42 L296 64.5 L296 64.5 L320 87"
          stroke="currentColor"
          stroke-width="8"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          opacity="0.7"
          d="M400 42 L424 64.5 L424 64.5 L400 87"
          stroke="currentColor"
          stroke-width="8"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <rect x="351" y="52" width="18" height="25" rx="4" fill="currentColor" opacity="0.25"/>
        <path
          opacity="0.7"
          d="M220 50 L204 64.5 L204 64.5 L220 79"
          stroke="currentColor"
          stroke-width="6"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          opacity="0.7"
          d="M500 50 L516 64.5 L516 64.5 L500 79"
          stroke="currentColor"
          stroke-width="6"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          opacity="0.7"
          d="M152 54 L140 64.5 L140 64.5 L152 75"
          stroke="currentColor"
          stroke-width="4"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          opacity="0.7"
          d="M568 54 L580 64.5 L580 64.5 L568 75"
          stroke="currentColor"
          stroke-width="4"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          opacity="0.7"
          d="M100 56 L92 64.5 L92 64.5 L100 73"
          stroke="currentColor"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          opacity="0.7"
          d="M620 56 L628 64.5 L628 64.5 L620 73"
          stroke="currentColor"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          opacity="0.7"
          d="M56 58 L50 64.5 L50 64.5 L56 71"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          opacity="0.7"
          d="M664 58 L670 64.5 L670 64.5 L664 71"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="129">
          <rect width="720" height="129" fill={`url(#${maskGradient})`} />
        </mask>
        <linearGradient id={maskGradient} x1="360" y1="0" x2="360" y2="112" gradientUnits="userSpaceOnUse">
          <stop stop-color="white" stop-opacity="0.7" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <filter
          id={filter}
          x="0"
          y="0"
          width="720.002"
          height="130.001"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4938_16028" />
        </filter>
      </defs>
    </svg>
  )
}
