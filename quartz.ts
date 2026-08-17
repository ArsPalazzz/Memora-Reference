import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"

componentRegistry.setOptionOverrides("@quartz-community/explorer", {
  folderDefaultState: "open",
  useSavedState: false,
  filterFn: (node) => {
    const segment = (node.slugSegment ?? "").toLowerCase()
    if (segment === "tags") return false

    const slug = (node.slug ?? "").toLowerCase().replace(/\/index$/, "")
    const parts = slug.split("/").filter(Boolean)

    // Root of the explorer trie (and the site index itself).
    if (parts.length === 0) return true

    if (parts[0] !== "english") return false
    if (parts.length === 1) return true
    if (parts[1] === "readme") return true
    if (["rules", "words", "examples"].includes(parts[1])) return true

    return false
  },
  mapFn: (node) => {
    // Show Rules / Words / Examples at the top of the sidebar,
    // instead of nesting them under english → English.
    if (!node.slugSegment) {
      const english = node.children.find(
        (child) => (child.slugSegment ?? "").toLowerCase() === "english",
      )
      if (english) {
        node.children = english.children
      }
    }

    const titles = {
      rules: "Rules",
      words: "Words",
      examples: "Examples",
      readme: "English",
    }
    const key = (node.slugSegment ?? "").toLowerCase()
    if (titles[key]) {
      node.displayName = titles[key]
    }
  },
  sortFn: (a, b) => {
    const order = ["rules", "words", "examples", "readme"]
    const rank = (node) => {
      const key = (node.slugSegment ?? "").toLowerCase()
      const idx = order.indexOf(key)
      if (idx !== -1) return idx
      return node.isFolder ? 10 : 20
    }

    const bySection = rank(a) - rank(b)
    if (bySection !== 0) return bySection
    if (a.isFolder && !b.isFolder) return -1
    if (!a.isFolder && b.isFolder) return 1
    return a.displayName.localeCompare(b.displayName, undefined, { numeric: true })
  },
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
