import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import { enableAccentColorPicker } from "./quartz/components/AccentColor"

enableAccentColorPicker()

componentRegistry.setOptionOverrides("@quartz-community/explorer", {
  folderDefaultState: "open",
  useSavedState: false,
  filterFn: (node) => {
    const name = (node.slugSegment || "").toLowerCase()
    if (name === "tags") return false
    const slug = (node.slug || "").toLowerCase()
    if (slug.indexOf("/inbox") !== -1) return false
    if (slug.indexOf("inbox/") !== -1) return false
    if (slug.indexOf("study-plan") !== -1) return false
    return true
  },
  mapFn: (node) => {
    if (!node.slugSegment) {
      let english = null
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]
        if ((child.slugSegment || "").toLowerCase() === "english") {
          english = child
          break
        }
      }
      if (english) {
        node.children = english.children
      }
    }

    const key = (node.slugSegment || "").toLowerCase()
    if (key === "rules") node.displayName = "Rules"
    if (key === "words") node.displayName = "Words"
    if (key === "examples") node.displayName = "Examples"
    if (key === "readme") node.displayName = "English"
  },
  sortFn: (a, b) => {
    const order = ["rules", "words", "examples", "readme"]
    const keyA = (a.slugSegment || "").toLowerCase()
    const keyB = (b.slugSegment || "").toLowerCase()
    const idxA = order.indexOf(keyA)
    const idxB = order.indexOf(keyB)
    const rankA = idxA !== -1 ? idxA : a.isFolder ? 10 : 20
    const rankB = idxB !== -1 ? idxB : b.isFolder ? 10 : 20
    if (rankA !== rankB) return rankA - rankB
    if (a.isFolder && !b.isFolder) return -1
    if (!a.isFolder && b.isFolder) return 1
    return a.displayName.localeCompare(b.displayName, undefined, { numeric: true })
  },
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
