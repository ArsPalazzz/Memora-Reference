import test, { describe } from "node:test"
import assert from "node:assert"
import {
  ensureSitePathname,
  isFolderPageSlug,
  isQuartzHtml,
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
