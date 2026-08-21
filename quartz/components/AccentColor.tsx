import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { componentRegistry } from "./registry"
import type { ComponentManifest } from "./registry"
import { concatenateResources } from "../util/resources"
import { ACCENT_PRESETS, DEFAULT_ACCENT_COLOR } from "./accent"
import script from "./scripts/accent-color.inline"

const accentColorCss = `
.theme-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.accent-color {
  position: relative;
  flex-shrink: 0;
}

.accent-color-toggle {
  cursor: pointer;
  padding: 0;
  margin: 0;
  width: 20px;
  height: 32px;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.accent-color-current {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--secondary);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--darkgray) 35%, transparent);
}

.accent-color-panel {
  display: none;
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  z-index: 100;
  padding: 0.55rem;
  border-radius: 10px;
  background: var(--light);
  border: 1px solid var(--lightgray);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--dark) 18%, transparent);
  grid-template-columns: repeat(5, 1.35rem);
  gap: 0.4rem;
}

.accent-color.open .accent-color-panel {
  display: grid;
}

.accent-color-swatch {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  background: var(--swatch, var(--secondary));
}

.accent-color-swatch:hover,
.accent-color-swatch:focus-visible {
  outline: none;
  border-color: color-mix(in srgb, var(--dark) 35%, transparent);
}

.accent-color-swatch.selected {
  border-color: var(--dark);
  box-shadow: 0 0 0 1px var(--light);
}
`

const AccentColor: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={`accent-color${displayClass ? ` ${displayClass}` : ""}`}>
      <button
        type="button"
        class="accent-color-toggle"
        aria-label="Accent color"
        aria-haspopup="true"
        aria-expanded="false"
        title="Accent color"
      >
        <span
          class="accent-color-current"
          style={`background: ${DEFAULT_ACCENT_COLOR}`}
          aria-hidden="true"
        />
      </button>
      <div class="accent-color-panel" role="group" aria-label="Accent color presets">
        {ACCENT_PRESETS.map((preset) => (
          <button
            type="button"
            class="accent-color-swatch"
            data-color={preset.value}
            aria-label={preset.name}
            title={preset.name}
            style={`--swatch: ${preset.value}`}
          />
        ))}
      </div>
    </div>
  )
}

AccentColor.css = accentColorCss
AccentColor.beforeDOMLoaded = script

export default (() => AccentColor) satisfies QuartzComponentConstructor

function isDarkmodeRegistration(name: string, source: string) {
  const src = source.toLowerCase()
  if (!src.includes("darkmode")) return false
  return (
    name === "@quartz-community/darkmode" ||
    name === "Darkmode" ||
    name === "darkmode" ||
    name.endsWith("/Darkmode")
  )
}

function wrapDarkmode(
  Original: QuartzComponentConstructor | QuartzComponent,
): QuartzComponentConstructor {
  return (opts) => {
    const Darkmode =
      typeof Original === "function" && !("css" in Original)
        ? (Original as QuartzComponentConstructor)(opts)
        : (Original as QuartzComponent)
    const Accent = AccentColor

    const Component: QuartzComponent = (props) => (
      <div class="theme-controls">
        <Darkmode {...props} />
        <Accent {...props} />
      </div>
    )

    Component.css = concatenateResources(Darkmode.css, Accent.css)
    Component.beforeDOMLoaded = concatenateResources(
      Darkmode.beforeDOMLoaded,
      Accent.beforeDOMLoaded,
    )
    Component.afterDOMLoaded = concatenateResources(Darkmode.afterDOMLoaded, Accent.afterDOMLoaded)
    return Component
  }
}

/**
 * Must run before `loadQuartzConfig()` — layout is assembled inside that call,
 * so wrapping after the fact never reaches PageTypeDispatcher.
 */
export function enableAccentColorPicker() {
  const originalRegister = componentRegistry.register.bind(componentRegistry)
  componentRegistry.register = (
    name: string,
    component: QuartzComponent | QuartzComponentConstructor,
    source: string,
    manifest?: ComponentManifest,
  ) => {
    if (isDarkmodeRegistration(name, source)) {
      originalRegister(name, wrapDarkmode(component), source, manifest)
      return
    }
    originalRegister(name, component, source, manifest)
  }
}
