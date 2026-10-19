function replyParts(text) {
  return parseReply(String(text ?? ""), 0, "").parts;
}

function parseReply(text, start, closer) {
  const parts = [];
  let index = start;
  let plain = "";
  const flush = () => {
    if (!plain) return;
    parts.push({ type: "text", text: plain });
    plain = "";
  };
  while (index < text.length) {
    if (closer && text.startsWith(closer, index)) {
      flush();
      return { parts, index };
    }
    if (!closer && text.startsWith("```", index)) {
      const end = text.indexOf("```", index + 3);
      if (end !== -1) {
        flush();
        parts.push({ type: "fence", text: fenceBody(text.slice(index + 3, end)) });
        index = end + 3;
        continue;
      }
    }
    if (text[index] === "`") {
      const end = text.indexOf("`", index + 1);
      if (end > index + 1 && !text.slice(index + 1, end).includes("\n")) {
        flush();
        parts.push({ type: "code", text: text.slice(index + 1, end) });
        index = end + 1;
        continue;
      }
    }
    const marker = text.startsWith("**", index) ? "**" : text.startsWith("__", index) ? "__" : "";
    if (marker && marker !== closer) {
      const inner = parseReply(text, index + marker.length, marker);
      if (text.startsWith(marker, inner.index) && inner.parts.length) {
        flush();
        parts.push({ type: "strong", parts: inner.parts });
        index = inner.index + marker.length;
        continue;
      }
    }
    if (!closer) {
      const lineStart = index === start || text[index - 1] === "\n";
      if (lineStart && (text.startsWith("* ", index) || text.startsWith("- ", index))) {
        flush();
        parts.push({ type: "text", text: "• " });
        index += 2;
        continue;
      }
    }
    const emMarker = text[index] === "*" && text[index + 1] !== "*" ? "*" : text[index] === "_" && text[index + 1] !== "_" ? "_" : "";
    if (emMarker && emMarker !== closer) {
      const inner = parseReply(text, index + 1, emMarker);
      const body = text.slice(index + 1, inner.index);
      if (text.startsWith(emMarker, inner.index) && body && !body.startsWith(" ") && !body.endsWith(" ") && !body.includes("\n")) {
        flush();
        parts.push({ type: "em", parts: inner.parts });
        index = inner.index + 1;
        continue;
      }
    }
    plain += text[index];
    index += 1;
  }
  flush();
  return { parts, index };
}

function fenceBody(raw) {
  let body = raw.replace(/^\r?\n/, "");
  const breakAt = body.indexOf("\n");
  if (breakAt !== -1 && /^[A-Za-z0-9_+.#-]+$/.test(body.slice(0, breakAt).trim())) {
    body = body.slice(breakAt + 1);
  }
  return body.replace(/\n$/, "");
}
