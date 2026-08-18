import test, { describe } from "node:test"
import assert from "node:assert"
import {
  ensureSitePathname,
  isFolderPageSlug,
  isQuartzHtml,
  preserveCollapsedExplorer,
  resolveClientUrl,
  siteBasePath,
} from "./util"

describe("site URL helpers", () => {
  test("siteBasePath strips a trailing slash", () => {
    assert.strictEqual(siteBasePath("/Memora-Reference"), "/Memora-Reference")
    assert.strictEqual(siteBasePath("/Memora-Reference/"), "/Memora-Reference")
    assert.strictEqual(siteBasePath(""), "")
    assert.strictEqual(siteBasePath(undefined), "")
  })

  test("isFolderPageSlug detects index slugs", () => {
    assert.strictEqual(isFolderPageSlug("index"), true)
    assert.strictEqual(isFolderPageSlug("english/rules/index"), true)
    assert.strictEqual(isFolderPageSlug("english/rules/conditionals"), false)
  })

  test("ensureSitePathname restores a dropped project prefix", () => {
    assert.strictEqual(
      ensureSitePathname("/english/rules/conditionals/", "/Memora-Reference"),
      "/Memora-Reference/english/rules/conditionals/",
    )
    assert.strictEqual(
      ensureSitePathname("/Memora-Reference/english/rules/", "/Memora-Reference"),
      "/Memora-Reference/english/rules/",
    )
    assert.strictEqual(ensureSitePathname("/english/rules/", ""), "/english/rules/")
  })

  test("resolveClientUrl keeps the repo prefix from a folder URL without a trailing slash", () => {
    const url = resolveClientUrl(
      "../../english/rules/conditionals",
      "https://arspalazzz.github.io/Memora-Reference/english/rules",
      "english/rules/index",
      "/Memora-Reference",
    )
    assert.strictEqual(
      url.href,
      "https://arspalazzz.github.io/Memora-Reference/english/rules/conditionals",
    )
  })

  test("resolveClientUrl restores prefix for root-relative links", () => {
    const url = resolveClientUrl(
      "/english/rules/conditionals/",
      "https://arspalazzz.github.io/Memora-Reference/english/rules/",
      "english/rules/index",
      "/Memora-Reference",
    )
    assert.strictEqual(
      url.href,
      "https://arspalazzz.github.io/Memora-Reference/english/rules/conditionals/",
    )
  })

  test("isQuartzHtml detects the generator meta tag", () => {
    assert.strictEqual(isQuartzHtml('<meta name="generator" content="Quartz" />'), true)
    assert.strictEqual(isQuartzHtml("<title>Site not found · GitHub Pages</title>"), false)
  })
})

describe("preserveCollapsedExplorer", () => {
  function explorerRoot(collapsed: boolean) {
    const classes = new Set(collapsed ? ["explorer", "collapsed"] : ["explorer"])
    let ariaExpanded = collapsed ? "false" : "true"
    const explorer = {
      classList: {
        contains: (name: string) => classes.has(name),
        add: (name: string) => {
          classes.add(name)
        },
      },
      getAttribute: (name: string) => (name === "aria-expanded" ? ariaExpanded : null),
      setAttribute: (name: string, value: string) => {
        if (name === "aria-expanded") ariaExpanded = value
      },
    }
    return {
      root: { querySelector: () => explorer },
      classes,
      getAriaExpanded: () => ariaExpanded,
    }
  }

  test("copies collapsed from the live explorer onto the next document", () => {
    const from = explorerRoot(true)
    const to = explorerRoot(false)

    preserveCollapsedExplorer(from.root as ParentNode, to.root as ParentNode)

    assert.ok(to.classes.has("collapsed"))
    assert.strictEqual(to.getAriaExpanded(), "false")
  })

  test("leaves an open explorer open so the close animation can play", () => {
    const from = explorerRoot(false)
    const to = explorerRoot(false)

    preserveCollapsedExplorer(from.root as ParentNode, to.root as ParentNode)

    assert.strictEqual(to.classes.has("collapsed"), false)
  })
})
