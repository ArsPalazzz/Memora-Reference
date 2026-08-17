const OVERLAY_ID = "quartz-image-lightbox"

let overlayEl: HTMLDivElement | null = null
let overlayImg: HTMLImageElement | null = null
let closeButtonEl: HTMLButtonElement | null = null
let ignoreCloseUntil = 0

const isContentImage = (img: HTMLImageElement): boolean => {
  if (img.id === "quartz-lightbox-image" || img.classList.contains("quartz-lightbox-image")) {
    return false
  }
  if (img.closest(`#${OVERLAY_ID}`)) return false
  if (img.closest(".explorer, .search, .graph, .popover, button, svg")) return false
  return Boolean(img.closest("article, .markdown-preview-view"))
}

const ensureOverlay = () => {
  overlayEl = document.getElementById(OVERLAY_ID) as HTMLDivElement | null
  if (!overlayEl) {
    overlayEl = document.createElement("div")
    overlayEl.id = OVERLAY_ID
    overlayEl.className = "quartz-lightbox-overlay"
    overlayEl.setAttribute("role", "dialog")
    overlayEl.setAttribute("aria-modal", "true")
    overlayEl.setAttribute("aria-label", "Image preview")
    overlayEl.innerHTML =
      '<button class="quartz-lightbox-close" type="button" aria-label="Close">&times;</button>' +
      '<img id="quartz-lightbox-image" class="quartz-lightbox-image" alt="" />'
  }

  overlayImg = overlayEl.querySelector(".quartz-lightbox-image")
  closeButtonEl = overlayEl.querySelector(".quartz-lightbox-close")

  // Keep the overlay outside <body> so SPA morphs do not delete it.
  if (overlayEl.parentElement !== document.documentElement) {
    document.documentElement.appendChild(overlayEl)
  }
}

const openLightbox = (src: string, alt: string) => {
  ensureOverlay()
  if (!overlayEl || !overlayImg || !src) return

  overlayImg.src = src
  overlayImg.alt = alt ?? ""
  overlayEl.classList.add("is-open")
  document.body.style.overflow = "hidden"
  ignoreCloseUntil = Date.now() + 400
  closeButtonEl?.focus?.()
}

const closeLightbox = () => {
  if (!overlayEl) return
  if (Date.now() < ignoreCloseUntil) return

  overlayEl.classList.remove("is-open")
  if (overlayImg) overlayImg.removeAttribute("src")
  document.body.style.overflow = ""
}

const imageFromEvent = (target: EventTarget | null): HTMLImageElement | null => {
  if (!(target instanceof Element)) return null
  const img = target.closest("img")
  if (!(img instanceof HTMLImageElement)) return null
  if (!isContentImage(img)) return null
  return img
}

let bound = false
const bindOnce = () => {
  if (bound) return
  bound = true

  const activate = (event: Event) => {
    if (overlayEl?.classList.contains("is-open")) return
    const img = imageFromEvent(event.target)
    if (!img) return

    event.preventDefault()
    event.stopPropagation()
    openLightbox(img.currentSrc || img.src, img.alt)
  }

  document.addEventListener("click", activate, true)

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && overlayEl?.classList.contains("is-open")) {
        ignoreCloseUntil = 0
        closeLightbox()
      }
    },
    true,
  )

  document.addEventListener(
    "click",
    (event) => {
      if (!overlayEl?.classList.contains("is-open")) return
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest(".quartz-lightbox-image")) return
      if (target.closest(".quartz-lightbox-close") || target === overlayEl) {
        ignoreCloseUntil = 0
        closeLightbox()
      }
    },
    true,
  )
}

const initLightbox = () => {
  ensureOverlay()
  bindOnce()
}

initLightbox()
document.addEventListener("DOMContentLoaded", initLightbox)
document.addEventListener("nav", initLightbox)
