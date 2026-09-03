/**
 * The subset of Markdown that event bodies use (doc/03 template, backend/content/drafts): "###" headings,
 * paragraphs separated by blank lines, *italic* and **bold**. Anything else is shown as text.
 * A full renderer is not worth its bundle weight while bodies are this regular.
 */
export type Block = { type: "heading" | "paragraph"; text: string };
export type Inline = { type: "text" | "em" | "strong"; text: string };

export function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of markdown.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    let paragraph: string[] = [];
    const flush = () => {
      if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    };
    for (const line of lines) {
      const heading = /^#{1,6}\s+(.*)$/.exec(line);
      if (heading) { flush(); blocks.push({ type: "heading", text: heading[1].trim() }); }
      else paragraph.push(line);
    }
    flush();
  }
  return blocks;
}

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) });
    out.push(m[1] !== undefined ? { type: "strong", text: m[1] } : { type: "em", text: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out;
}
