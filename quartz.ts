import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"

componentRegistry.setOptionOverrides("@quartz-community/explorer", {
  filterFn: (node) => {
    const publishedSections = new Set(["Rules", "Words", "Examples"])
    if (node.slugSegment === "tags") return false

    const segments = node.slugSegments ?? []
    if (segments.length === 0) return true

    if (segments.length === 1) {
      return node.slugSegment === "english"
    }

    if (segments[0] === "english" && segments.length === 2) {
      if (node.isFolder) {
        return publishedSections.has(node.slugSegment ?? "")
      }
      return node.slugSegment?.toLowerCase() === "readme"
    }

    if (segments[0] === "english" && publishedSections.has(segments[1])) {
      return true
    }

    return false
  },
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
