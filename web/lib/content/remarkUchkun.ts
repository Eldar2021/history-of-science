import { visit } from "unist-util-visit";
import type { Blockquote, Paragraph, Parent, Root, RootContent } from "mdast";
import { parseAlert, youtubeId } from "./markdown";

/**
 * Three conventions on top of GitHub-flavoured Markdown, all borrowed rather than invented so that a
 * body written in the admin behaves the way the writer expects it to (ADR-033):
 *
 *   > [!NOTE] ...            a callout, GitHub's alert syntax (plus our own [!THEORY])
 *   https://youtu.be/xyz     alone in a paragraph, an embedded player
 *   ![alt](src "credit")     alone in a paragraph, a figure with a caption
 *
 * All three are marked on the tree with data attributes; `components/content/Markdown.tsx` turns
 * those into the boxes. Nothing here emits HTML, so raw HTML can stay switched off.
 */
export function remarkUchkun() {
  return (tree: Root) => {
    visit(tree, "blockquote", (node: Blockquote) => {
      const first = node.children[0];
      if (first?.type !== "paragraph") return;
      const lead = first.children[0];
      if (lead?.type !== "text") return;
      const alert = parseAlert(lead.value);
      if (!alert) return;
      lead.value = alert.rest;
      // An alert whose marker was the whole line leaves an empty text node, and maybe an empty paragraph.
      if (!lead.value) first.children.shift();
      if (!first.children.length) node.children.shift();
      node.data = { ...node.data, hProperties: { "data-alert": alert.kind } };
    });

    visit(tree, "paragraph", (node: Paragraph, index: number | undefined, parent: Parent | undefined) => {
      const children = node.children.filter((c) => !(c.type === "text" && !c.value.trim()));
      if (children.length !== 1) return;
      const only = children[0];

      // remark-gfm turns a bare URL into a link, so both a pasted and a written-out link land here.
      const href = only.type === "link" ? only.url : only.type === "text" ? only.value.trim() : null;
      const id = href ? youtubeId(href) : null;
      if (id) {
        node.children = [];
        node.data = { ...node.data, hName: "div", hProperties: { "data-youtube": id } };
        return;
      }

      // A lone image becomes a <figure>, which may not sit inside the <p> a paragraph would render.
      if (only.type === "image" && parent && index !== undefined) {
        only.data = { ...only.data, hProperties: { "data-figure": "" } };
        parent.children[index] = only as RootContent;
      }
    });
  };
}
