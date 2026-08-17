const OVERLAY_ID = "quartz-image-lightbox"
const TARGET_CLASS = "quartz-lightbox-target"

let overlayEl: HTMLDivElement | null = null
let overlayImg: HTMLImageElement | null = null
let closeButtonEl: HTMLButtonElement | null = null
let lastFocusedEl: HTMLElement | null = null

const ensureOverlay = () => {
  if (overlayEl) return

  overlayEl = document.createElement("div")
  overlayEl.id = OVERLAY_ID
  overlayEl.className = "quartz-lightbox-overlay"
  overlayEl.setAttribute("role", "dialog")
  overlayEl.setAttribute("aria-modal", "true")
  overlayEl.style.display = "none"

  overlayEl.innerHTML = `
    <div class="quartz-lightbox-content">
      <button class="quartz-lightbox-close" aria-label="Close lightbox" type="button">&times;</button>
      <img class="quartz-lightbox-image" alt="" />
    </div>
  `

  document.body.appendChild(overlayEl)
  overlayImg = overlayEl.querySelector(".quartz-lightbox-image")
  closeButtonEl = overlayEl.querySelector(".quartz-lightbox-close")

  overlayEl.addEventListener("click", (e) => {
    // Clicking on the backdrop closes; clicking inside doesn't.
    if (e.target === overlayEl) closeLightbox()
  })

  closeButtonEl?.addEventListener("click", () => closeLightbox())
}

const openLightbox = (src: string, alt: string) => {
  ensureOverlay()
  if (!overlayEl || !overlayImg) return

  lastFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null

  overlayImg.src = src
  overlayImg.alt = alt ?? ""

  overlayEl.style.display = "flex"
  overlayEl.classList.add("is-open")

  // Prevent background scrolling while the overlay is open.
  document.body.style.overflow = "hidden"

  closeButtonEl?.focus?.()
}

const closeLightbox = () => {
  if (!overlayEl) return

  overlayEl.classList.remove("is-open")
  overlayEl.style.display = "none"
  overlayImg && (overlayImg.src = overlayImg.src) // keep cached src; no-op for browser cache

  document.body.style.overflow = ""

  lastFocusedEl?.focus?.()
  lastFocusedEl = null
}

const enableTargets = () => {
  // We mark images that should open the lightbox.
  // Using delegation means we only need to add a class once.
  const imgs = document.querySelectorAll("article img, .markdown-preview-view img")
  imgs.forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return
    if (img.classList.contains(TARGET_CLASS)) return
    img.classList.add(TARGET_CLASS)
    img.loading = img.loading || "lazy"
    img.decoding = img.decoding || "async"
  })
}

let delegationBound = false
const setupDelegation = () => {
  if (delegationBound) return
  delegationBound = true

  document.addEventListener("click", (e) => {
    const target = e.target
    if (!(target instanceof Element)) return

    const img = target.closest?.("img")
    if (!(img instanceof HTMLImageElement)) return
    if (!img.classList.contains(TARGET_CLASS)) return

    e.preventDefault()
    e.stopPropagation()

    // Use the actual currentSrc (important for responsive/lazy cases).
    const src = img.currentSrc || img.src
    openLightbox(src, img.alt)
  })

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return
    // Only close if overlay is open.
    if (overlayEl?.classList.contains("is-open")) closeLightbox()
  })
}

const initLightbox = () => {
  enableTargets()
  ensureOverlay()
  setupDelegation()
}

document.addEventListener("DOMContentLoaded", initLightbox)
document.addEventListener("nav", initLightbox)

