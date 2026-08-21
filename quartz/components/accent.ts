export const DEFAULT_ACCENT_COLOR = "#5961d3"

export const ACCENT_PRESETS = [
  { name: "Purple", value: "#5961d3" },
  { name: "Blue", value: "#1e88e5" },
  { name: "Teal", value: "#00897b" },
  { name: "Green", value: "#43a047" },
  { name: "Orange", value: "#fb8c00" },
  { name: "Red", value: "#e53935" },
  { name: "Pink", value: "#d81b60" },
  { name: "Indigo", value: "#3949ab" },
  { name: "Cyan", value: "#00acc1" },
  { name: "Amber", value: "#ffb300" },
] as const

export const ACCENT_STORAGE_KEY = "accent-color"

export type AccentPreset = (typeof ACCENT_PRESETS)[number]
