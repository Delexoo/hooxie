import assert from "node:assert/strict";
import test from "node:test";
import {
  changedSince,
  clipThought,
  focusFromTool,
  joinThought,
  foldActivity,
  joinReply,
  mergeFileChanges,
  parsePorcelain,
  replyFromMessage,
  thoughtFromMessage,
} from "../src/run-activity.ts";

test("a running shell is a background terminal and a finished one drops off the running list", () => {
  const started = foldActivity({ terminals: [], files: [] }, {
    type: "tool_call",
    call_id: "sh-1",
    name: "shell",
    status: "running",
    args: { command: "npm test" },
  });
  assert.equal(started.terminals.length, 1);
  assert.equal(started.terminals[0].command, "npm test");
  assert.equal(started.terminals[0].status, "running");
  const finished = foldActivity(started, {
    type: "tool_call",
    call_id: "sh-1",
    name: "shell",
    status: "completed",
    args: { command: "npm test" },
  });
  assert.equal(finished.terminals[0].status, "done");
});

test("a backgrounded shell stays running after the tool returns", () => {
  const activity = foldActivity({ terminals: [], files: [] }, {
    type: "tool_call",
    call_id: "sh-2",
    name: "shell",
    status: "completed",
    args: { command: "npm start", block_until_ms: 0 },
  });
  assert.equal(activity.terminals[0].status, "running");
  assert.equal(activity.terminals[0].background, true);
});

test("edits, writes, and deletes become the modified file list", () => {
  let activity = foldActivity({ terminals: [], files: [] }, {
    type: "tool_call",
    call_id: "e-1",
    name: "edit",
    status: "completed",
    args: { path: "src/app.ts" },
  });
  activity = foldActivity(activity, {
    type: "tool_call",
    call_id: "e-2",
    name: "write",
    status: "completed",
    args: { file_path: "src/new.ts" },
  });
  activity = foldActivity(activity, {
    type: "tool_call",
    call_id: "e-3",
    name: "delete",
    status: "completed",
    args: { path: "src/old.ts" },
  });
  assert.deepEqual(activity.files, [
    { path: "src/app.ts", kind: "modified" },
    { path: "src/new.ts", kind: "added" },
    { path: "src/old.ts", kind: "deleted" },
  ]);
});

test("git status only reports paths that changed after the run started", () => {
  const before = parsePorcelain(" M src/keep.ts\0?? src/old.ts\0");
  const after = parsePorcelain(" M src/keep.ts\0?? src/old.ts\0 M public/app.js\0?? src/fresh.ts\0");
  assert.deepEqual(changedSince(before, after), [
    { path: "public/app.js", kind: "modified" },
    { path: "src/fresh.ts", kind: "added" },
  ]);
  assert.equal(mergeFileChanges([{ path: "public/app.js", kind: "modified" }], changedSince(before, after)).length, 2);
});

test("assistant text grows as the run streams", () => {
  const chunk = replyFromMessage({
    type: "assistant",
    message: { content: [{ type: "text", text: "Hello" }] },
  });
  assert.equal(joinReply("", chunk), "Hello");
  assert.equal(joinReply("Hello", "Hello world"), "Hello world");
  assert.equal(joinReply("Hello", " world"), "Hello world");
  assert.equal(replyFromMessage({ type: "thinking", text: "hidden" }), "");
});

test("thinking text and tool focus become the live thought line", () => {
  assert.equal(thoughtFromMessage({ type: "thinking", text: "Check the dashboard CSS next." }), "Check the dashboard CSS next.");
  assert.equal(
    joinThought("Inspect the context.", "The file search failed to locate the correct path."),
    "The file search failed to locate the correct path.",
  );
  assert.equal(joinThought("The file", " search failed"), "The file search failed");
  assert.equal(
    clipThought("next.The file search failed to locate the correct path."),
    "The file search failed to locate the correct path.",
  );
  assert.equal(clipThought("a".repeat(130)).startsWith("…"), true);
  assert.equal(
    focusFromTool({
      type: "tool_call",
      call_id: "r-1",
      name: "read",
      status: "running",
      args: { path: "public/app.js" },
    }),
    "Reading public/app.js",
  );
  assert.equal(
    focusFromTool({
      type: "tool_call",
      call_id: "r-1",
      name: "read",
      status: "completed",
      args: { path: "public/app.js" },
    }),
    "",
  );
});
