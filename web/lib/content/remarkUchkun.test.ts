import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { remarkUchkun } from "./remarkUchkun";

const render = (md: string) =>
  unified().use(remarkParse).use(remarkGfm).use(remarkUchkun).use(remarkRehype).use(rehypeStringify).processSync(md).toString();

describe("remarkUchkun", () => {
  it("marks an alert and drops its marker", () => {
    const html = render("> [!THEORY]\n> Mass is energy.");
    expect(html).toContain('data-alert="theory"');
    expect(html).toContain("Mass is energy.");
    expect(html).not.toContain("[!THEORY]");
  });
  it("leaves an ordinary quotation as a quotation", () => {
    const html = render("> Standing on the shoulders of giants.");
    expect(html).toContain("<blockquote>");
    expect(html).not.toContain("data-alert");
  });
  it("turns a lone YouTube link into a marked div", () => {
    expect(render("https://youtu.be/aQhbGDwCu-A")).toContain('data-youtube="aQhbGDwCu-A"');
  });
  it("leaves a YouTube link that sits in a sentence", () => {
    expect(render("Watch https://youtu.be/aQhbGDwCu-A tonight.")).not.toContain("data-youtube");
  });
  it("lifts a lone image out of its paragraph so it can become a figure", () => {
    const html = render('![The arc](a.jpg "NASA · Public domain")');
    expect(html).toContain("data-figure");
    expect(html).not.toMatch(/<p>\s*<img/);
  });
  it("leaves an image that sits inside a sentence", () => {
    expect(render("Here ![it](a.jpg) is.")).not.toContain("data-figure");
  });
});
