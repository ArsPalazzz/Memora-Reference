import {
  ACCENT_PRESETS,
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT_COLOR,
} from "../accent"

const PRESET_VALUES = new Set(ACCENT_PRESETS.map((p) => p.value.toLowerCase()))

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!match) return null
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)]
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
      .join("")
  )
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    default:
      h = ((r - g) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function mixWithWhite(hex: string, amount: number) {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const [r, g, b] = rgb
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount)
}

function withAlpha(hex: string, alpha: number) {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}

function normalizeAccent(value: string | null | undefined) {
  if (!value) return DEFAULT_ACCENT_COLOR
  const normalized = value.trim().toLowerCase()
  if (!PRESET_VALUES.has(normalized)) return DEFAULT_ACCENT_COLOR
  return ACCENT_PRESETS.find((p) => p.value.toLowerCase() === normalized)!.value
}

function applyAccent(raw: string) {
  const accent = normalizeAccent(raw)
  const lightSecondary = accent
  const lightTertiary = mixWithWhite(accent, 0.18)
  const darkSecondary = mixWithWhite(accent, 0.22)
  const darkTertiary = mixWithWhite(accent, 0.36)

  const root = document.documentElement
  const isDark = root.getAttribute("saved-theme") === "dark"
  const secondary = isDark ? darkSecondary : lightSecondary
  const tertiary = isDark ? darkTertiary : lightTertiary
  const highlight = withAlpha(secondary, isDark ? 0.16 : 0.14)
  const textHighlight = withAlpha(secondary, isDark ? 0.28 : 0.22)
  const hsl = (() => {
    const rgb = hexToRgb(secondary)
    return rgb ? rgbToHsl(...rgb) : { h: 0, s: 0, l: 0 }
  })()

  root.style.setProperty("--secondary", secondary)
  root.style.setProperty("--tertiary", tertiary)
  root.style.setProperty("--highlight", highlight)
  root.style.setProperty("--textHighlight", textHighlight)
  root.style.setProperty("--accent-h", String(hsl.h))
  root.style.setProperty("--accent-s", `${hsl.s}%`)
  root.style.setProperty("--accent-l", `${hsl.l}%`)
  root.setAttribute("data-accent", accent)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute("content", secondary)

  for (const rootEl of document.querySelectorAll<HTMLElement>(".accent-color")) {
    const swatch = rootEl.querySelector<HTMLElement>(".accent-color-current")
    if (swatch) swatch.style.background = accent
    for (const btn of rootEl.querySelectorAll<HTMLButtonElement>(".accent-color-swatch")) {
      const selected = btn.dataset.color?.toLowerCase() === accent.toLowerCase()
      btn.classList.toggle("selected", selected)
      btn.setAttribute("aria-pressed", selected ? "true" : "false")
    }
  }

  document.dispatchEvent(new CustomEvent("accentchange", { detail: { accent } }))
}

function setAccent(value: string) {
  const accent = normalizeAccent(value)
  localStorage.setItem(ACCENT_STORAGE_KEY, accent)
  applyAccent(accent)
}

// Apply before first paint to avoid FOUC
applyAccent(localStorage.getItem(ACCENT_STORAGE_KEY))

function closeAllPickers() {
  for (const el of document.querySelectorAll(".accent-color.open")) {
    el.classList.remove("open")
    el.querySelector(".accent-color-toggle")?.setAttribute("aria-expanded", "false")
  }
}

function setupAccentColor() {
  for (const root of document.getElementsByClassName("accent-color")) {
    const toggle = root.querySelector<HTMLButtonElement>(".accent-color-toggle")
    const panel = root.querySelector<HTMLElement>(".accent-color-panel")
    if (!toggle || !panel) continue

    const onToggle = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      const willOpen = !root.classList.contains("open")
      closeAllPickers()
      if (willOpen) {
        root.classList.add("open")
        toggle.setAttribute("aria-expanded", "true")
      }
    }

    const onSwatch = (e: Event) => {
      const target = (e.target as HTMLElement | null)?.closest(
        ".accent-color-swatch",
      ) as HTMLButtonElement | null
      if (!target?.dataset.color) return
      e.preventDefault()
      e.stopPropagation()
      setAccent(target.dataset.color)
      closeAllPickers()
    }

    const onDocClick = (e: Event) => {
      if (!root.contains(e.target as Node)) closeAllPickers()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAllPickers()
    }

    toggle.addEventListener("click", onToggle)
    panel.addEventListener("click", onSwatch)
    document.addEventListener("click", onDocClick)
    document.addEventListener("keydown", onKey)

    window.addCleanup(() => {
      toggle.removeEventListener("click", onToggle)
      panel.removeEventListener("click", onSwatch)
      document.removeEventListener("click", onDocClick)
      document.removeEventListener("keydown", onKey)
    })
  }

  // Re-apply when light/dark theme flips so derived tones stay correct
  applyAccent(localStorage.getItem(ACCENT_STORAGE_KEY))
}

document.addEventListener("nav", setupAccentColor)
document.addEventListener("render", setupAccentColor)
document.addEventListener("themechange", () => {
  applyAccent(localStorage.getItem(ACCENT_STORAGE_KEY))
})
