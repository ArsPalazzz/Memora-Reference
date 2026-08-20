import test, { describe } from "node:test"
import assert from "node:assert"
import { convertAdmonitionFences } from "./obsidianAdmonition"

describe("convertAdmonitionFences", () => {
  test("converts ad-tip with title and body to a tip callout", () => {
    const src = `Before

\`\`\`ad-tip
title: Example
color: 78, 121, 237
- **If** you **study**, you**'ll pass**.
\`\`\`

After`
    const out = convertAdmonitionFences(src)
    assert.ok(out.includes("> [!tip] Example"))
    assert.ok(out.includes("> - **If** you **study**, you**'ll pass**."))
    assert.ok(!out.includes("```ad-tip"))
    assert.ok(!out.includes("color:"))
  })

  test("supports collapse metadata", () => {
    const src = `\`\`\`ad-note
title: Hidden
collapse: closed
secret
\`\`\``
    const out = convertAdmonitionFences(src)
    assert.ok(out.includes("> [!note]- Hidden"))
    assert.ok(out.includes("> secret"))
  })

  test("handles empty body", () => {
    const src = `\`\`\`ad-info
title: Empty
\`\`\``
    const out = convertAdmonitionFences(src)
    assert.strictEqual(out, "> [!info] Empty\n>")
  })
})
