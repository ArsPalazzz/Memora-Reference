/** Strip a trailing slash from the deployed subpath (`/Memora-Reference`). */
export function siteBasePath(raw: string | undefined): string {
  if (!raw) return ""
  return raw.endsWith("/") ? raw.slice(0, -1) : raw
}

export function isFolderPageSlug(slug: string | undefined): boolean {
  return slug === "index" || !!slug?.endsWith("/index")
}

/**
 * GitHub project Pages live under a subpath. Root-relative links like
 * `/english/rules` and `../..` from a folder URL *without* a trailing slash
 * both resolve to `https://user.github.io/english/...`, dropping the repo prefix.
 */
export function ensureSitePathname(pathname: string, basePath: string): string {
  const base = siteBasePath(basePath)
  if (!base) return pathname
  if (pathname === base || pathname.startsWith(`${base}/`)) return pathname
  return `${base}${pathname.startsWith("/") ? "" : "/"}${pathname}`
}

export function resolveClientUrl(
  href: string,
  currentHref: string,
  slug: string | undefined,
  basePath: string | undefined,
): URL {
  const base = new URL(currentHref)
  if (isFolderPageSlug(slug) && !base.pathname.endsWith("/")) {
    base.pathname += "/"
  }
  const url = new URL(href, base)
  url.pathname = ensureSitePathname(url.pathname, siteBasePath(basePath))
  return url
}

export function isQuartzHtml(text: string): boolean {
  return /<meta[^>]*name=["']generator["'][^>]*content=["']Quartz["']/i.test(text)
}

/**
 * Incoming pages render Explorer without `.collapsed`. If the live panel is
 * already closed, copy that class onto the next document so SPA morph does not
 * briefly open it and play the close animation.
 */
export function preserveCollapsedExplorer(from: ParentNode, to: ParentNode): void {
  const current = from.querySelector(".explorer")
  const next = to.querySelector(".explorer")
  if (!current || !next) return
  if (!current.classList.contains("collapsed")) return
  next.classList.add("collapsed")
  next.setAttribute("aria-expanded", "false")
}

export function registerEscapeHandler(outsideContainer: HTMLElement | null, cb: () => void) {
  if (!outsideContainer) return
  function click(this: HTMLElement, e: HTMLElementEventMap["click"]) {
    if (e.target !== this) return
    e.preventDefault()
    e.stopPropagation()
    cb()
  }

  function esc(e: HTMLElementEventMap["keydown"]) {
    if (!e.key.startsWith("Esc")) return
    e.preventDefault()
    cb()
  }

  outsideContainer?.addEventListener("click", click)
  window.addCleanup(() => outsideContainer?.removeEventListener("click", click))
  document.addEventListener("keydown", esc)
  window.addCleanup(() => document.removeEventListener("keydown", esc))
}

export function removeAllChildren(node: HTMLElement) {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

// AliasRedirect emits HTML redirects which also have the link[rel="canonical"]
// containing the URL it's redirecting to.
// Extracting it here with regex is _probably_ faster than parsing the entire HTML
// with a DOMParser effectively twice (here and later in the SPA code), even if
// way less robust - we only care about our own generated redirects after all.
const canonicalRegex = /<link rel="canonical" href="([^"]*)">/

export async function fetchCanonical(url: URL): Promise<Response> {
  const res = await fetch(`${url}`)
  if (!res.headers.get("content-type")?.startsWith("text/html")) {
    return res
  }

  // reading the body can only be done once, so we need to clone the response
  // to allow the caller to read it if it's was not a redirect
  const text = await res.clone().text()
  const [_, redirect] = text.match(canonicalRegex) ?? []
  return redirect ? fetch(`${new URL(redirect, url)}`) : res
}
