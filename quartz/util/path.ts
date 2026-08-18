import {
  endsWith,
  getFileExtension,
  slugifyPath,
  stripSlashes,
} from "@quartz-community/utils"
import type { FilePath, FullSlug } from "@quartz-community/utils"

// Re-export shared path utilities from @quartz-community/utils
export {
  isFilePath,
  isFullSlug,
  isSimpleSlug,
  isRelativeURL,
  isAbsoluteURL,
  getFullSlug,
  simplifySlug,
  joinSegments,
  endsWith,
  trimSuffix,
  stripSlashes,
  getFileExtension,
  isFolderPath,
  getAllSegmentPrefixes,
  pathToRoot,
  resolveRelative,
  splitAnchor,
  slugTag,
  transformInternalLink,
  transformLink,
  normalizeHastElement,
} from "@quartz-community/utils"

export type {
  FilePath,
  FullSlug,
  SimpleSlug,
  RelativeURL,
  TransformOptions,
} from "@quartz-community/utils"

/**
 * Like `@quartz-community/utils` slugifyFilePath, but `folder/folder.md` stays
 * a child note instead of becoming `folder/index`. `index.md` / `_index.md`
 * still become the folder landing page.
 */
export function slugifyFilePath(fp: FilePath, excludeExt?: boolean): FullSlug {
  const stripped = stripSlashes(fp)
  const ext = getFileExtension(stripped)
  const withoutFileExt = ext ? stripped.replace(new RegExp(ext + "$"), "") : stripped
  const finalExt = excludeExt || [".md", ".html", undefined].includes(ext) ? "" : ext
  let slug = slugifyPath(withoutFileExt)
  if (endsWith(slug, "_index")) {
    slug = slug.replace(/_index$/, "index")
  }
  return (slug + (finalExt ?? "")) as FullSlug
}

// --- v5-specific exports below ---

export const QUARTZ = "quartz"

// from micromorph/src/utils.ts
// https://github.com/natemoo-re/micromorph/blob/main/src/utils.ts#L5
const _rebaseHtmlElement = (el: Element, attr: string, newBase: string | URL) => {
  const rebased = new URL(el.getAttribute(attr)!, newBase)
  el.setAttribute(attr, rebased.pathname + rebased.hash)
}
export function normalizeRelativeURLs(el: Element | Document, destination: string | URL) {
  el.querySelectorAll('[href=""], [href^="./"], [href^="../"]').forEach((item) => {
    _rebaseHtmlElement(item, "href", destination)
  })
  el.querySelectorAll('[src=""], [src^="./"], [src^="../"]').forEach((item) => {
    _rebaseHtmlElement(item, "src", destination)
  })
}
