import { Link, Meta } from "@solidjs/meta"

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M36 22 L22 36 L22 64 L36 78" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M64 22 L78 36 L78 64 L64 78" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="42" y="42" width="16" height="16" rx="3" fill="currentColor" opacity="0.25"/></svg>`

export const Favicon = () => {
  return (
    <>
      <Link rel="icon" type="image/svg+xml" href={`data:image/svg+xml,${encodeURIComponent(faviconSvg)}`} />
      <Link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
      <Link rel="shortcut icon" href="/favicon.ico" />
      <Link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <Link rel="manifest" href="/site.webmanifest" />
      <Meta name="apple-mobile-web-app-title" content="clisisCoder" />
    </>
  )
}
