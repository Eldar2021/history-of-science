/**
 * The Markdown an event body may use, one row per idea. The examples are the syntax itself, so they
 * are not translated; only the sentence explaining each row is (`admin.help.rows.*`). The help page
 * renders the right-hand column with the same component the site uses, so the page cannot drift
 * away from the renderer.
 */
export const CHEATSHEET = [
  { key: "headings", source: "### The scene\n\nA paragraph under it." },
  { key: "emphasis", source: "Plain, *emphasis*, **strong**." },
  { key: "list", source: "- first\n- second\n\n1. first\n2. second" },
  { key: "link", source: "[MacTutor](https://mathshistory.st-andrews.ac.uk/)" },
  { key: "image", source: '![Principia, title page](https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Newton%27s_Principia_title_page.png/500px-Newton%27s_Principia_title_page.png "Wikimedia Commons · Public domain · https://commons.wikimedia.org/wiki/File:Newton%27s_Principia_title_page.png")' },
  { key: "video", source: "https://www.youtube.com/watch?v=aQhbGDwCu-A" },
  { key: "callout", source: "> [!THEORY]\n> Mass and energy are two faces of one thing.\n\n> [!NOTE]\n> The sources disagree about the year." },
  { key: "code", source: "```\nfor each star:\n    read the arc\n```" },
  { key: "formula", source: "Inline: $E = mc^2$.\n\n$$\n\\frac{1}{T} = \\frac{1}{a^3}\n$$" },
  { key: "table", source: "| Year | Star count |\n| ---- | ---------- |\n| 1437 | 1018 |\n| 1598 | 1004 |" },
  { key: "quote", source: "> If I have seen further, it is by standing on the shoulders of giants." },
  { key: "rule", source: "Before.\n\n---\n\nAfter." },
] as const;
