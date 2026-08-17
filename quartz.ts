import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"

componentRegistry.setOptionOverrides("@quartz-community/explorer", {
  folderDefaultState: "open",
  useSavedState: false,
  filterFn: (node) => {
    const name = (node.slugSegment || "").toLowerCase()
    if (name === "tags") return false
    const slug = (node.slug || "").toLowerCase()
    if (slug.indexOf("/inbox") !== -1 || slug.indexOf("inbox/") !== -1) return false
    if (slug.indexOf("study-plan") !== -1) return false
    return true
  },
  mapFn: (node) => {
    if (!node.slugSegment) {
      const english = node.children.find(function (child) {
        return (child.slugSegment || "").toLowerCase() === "english"
      })
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
    const key = (node.slugSegment || "").toLowerCase()
    if (titles[key]) {
      node.displayName = titles[key]
    }
  },
  sortFn: (a, b) => {
    const order = ["rules", "words", "examples", "readme"]
    const rank = (node) => {
      const key = (node.slugSegment || "").toLowerCase()
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
