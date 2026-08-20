import { QuartzTransformerPlugin } from "../types"

const ADMONITION_FENCE =
  /^```ad-([A-Za-z][\w-]*)[^\n]*\r?\n([\s\S]*?)^```[ \t]*$/gm

const META_KEYS = new Set([
  "title",
  "collapse",
  "icon",
  "color",
  "metadata",
  "cssclasses",
  "cssClasses",
])

function parseAdmonitionBody(body: string): {
  title?: string
  collapse?: string
  content: string
} {
  const lines = body.replace(/\r\n/g, "\n").split("\n")
  let title: string | undefined
  let collapse: string | undefined
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (trimmed === "") {
      i++
      continue
    }
    const match = /^([A-Za-z][\w-]*)\s*:\s*(.*)$/.exec(trimmed)
    if (!match || !META_KEYS.has(match[1])) break
    const key = match[1]
    const value = match[2].trim()
    if (key === "title") title = value
    if (key === "collapse") collapse = value.toLowerCase()
    i++
  }

  while (i < lines.length && lines[i].trim() === "") i++
  const content = lines.slice(i).join("\n").replace(/\n+$/, "")
  return { title, collapse, content }
}

function collapseMarker(collapse: string | undefined): string {
  if (!collapse || collapse === "none" || collapse === "false") return ""
  if (collapse === "open" || collapse === "+" || collapse === "true") return "+"
  if (collapse === "closed" || collapse === "-" || collapse === "collapse") return "-"
  return ""
}

/** Convert Obsidian Admonition fences (` ```ad-tip `) to Quartz/Obsidian callouts. */
export function convertAdmonitionFences(src: string): string {
  return src.replace(ADMONITION_FENCE, (_full, type: string, body: string) => {
    const { title, collapse, content } = parseAdmonitionBody(body)
    const marker = collapseMarker(collapse)
    const header = title ? `[!${type}]${marker} ${title}` : `[!${type}]${marker}`
    const contentLines = content.length === 0 ? [""] : content.split("\n")
    return ["> " + header, ...contentLines.map((line) => (line === "" ? ">" : `> ${line}`))].join(
      "\n",
    )
  })
}

export const ObsidianAdmonition: QuartzTransformerPlugin = () => ({
  name: "ObsidianAdmonition",
  textTransform(_ctx, src) {
    return convertAdmonitionFences(src)
  },
})
