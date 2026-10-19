import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const context: { replyParts?: (text: string) => unknown } = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL("../public/reply-format.js", import.meta.url), "utf8"), context);
const replyParts = context.replyParts;
if (!replyParts) throw new Error("replyParts was not loaded.");

function parts(text: string) {
  return JSON.parse(JSON.stringify(replyParts?.(text)));
}

test("bold and inline code hide the marks", () => {
  assert.deepEqual(
    parts("Created `hello.html` on your Desktop. Open it in a browser to see **Hello world!**"),
    [
      { type: "text", text: "Created " },
      { type: "code", text: "hello.html" },
      { type: "text", text: " on your Desktop. Open it in a browser to see " },
      { type: "strong", parts: [{ type: "text", text: "Hello world!" }] },
    ],
  );
});

test("italic, bold, and code hide the marks", () => {
  assert.deepEqual(parts("See *Hello* and `file.txt` and **bold**"), [
    { type: "text", text: "See " },
    { type: "em", parts: [{ type: "text", text: "Hello" }] },
    { type: "text", text: " and " },
    { type: "code", text: "file.txt" },
    { type: "text", text: " and " },
    { type: "strong", parts: [{ type: "text", text: "bold" }] },
  ]);
});

test("a star at the start of a line is a bullet", () => {
  assert.deepEqual(parts("* First item"), [
    { type: "text", text: "• " },
    { type: "text", text: "First item" },
  ]);
});

test("unclosed marks stay visible", () => {
  assert.deepEqual(parts("See **Hello"), [{ type: "text", text: "See **Hello" }]);
});

test("a fenced block drops the fence and the language label", () => {
  assert.deepEqual(parts("```html\n<p>Hi</p>\n```"), [{ type: "fence", text: "<p>Hi</p>" }]);
});
