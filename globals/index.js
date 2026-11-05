import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { relative, sep } from "node:path";
import nunjucks from "nunjucks";
import { parseDocument } from "htmlparser2";
import { getElementsByTagName, textContent } from "domutils";

export const site_url = process.env.SITE_URL || "http://localhost:5001";

export function get_id(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Returns raw HTML: eleventy.config.js registers it with amendLibrary, which marks it safe.
export function heading(title) {
  const id = get_id(title);
  const escaped = nunjucks.lib.escape(title);
  return `<h2 aria-label="test-case-${id}" id="${id}">${escaped}</h2>`;
}

export function get_date() {
  const date = new Date();
  const month = date.toLocaleString("en", { month: "long" });
  return `${String(date.getDate()).padStart(2, "0")} ${month} ${date.getFullYear()}`;
}

function extractFilters(html) {
  const document = parseDocument(html);
  return getElementsByTagName("pre", document)
    .filter((pre) => {
      for (let ancestor = pre.parent; ancestor; ancestor = ancestor.parent) {
        const classes = (ancestor.attribs?.class || "").split(/\s+/);
        if (classes.includes("testcase-filters") || classes.includes("site-panel")) {
          return true;
        }
      }
      return false;
    })
    .map((pre) => textContent(pre));
}

export function createFilterSubscription() {
  const requests = [];

  function get_filters(specificPages) {
    // Resolve after Eleventy renders every page, including layouts and computed data.
    const marker = `<!-- subscription-filters:${requests.length} -->`;
    requests.push({ marker, specificPages });
    return marker;
  }

  function collect(pages, specificPages) {
    // Keep the published subscription's historical order, independent of filesystem ordering.
    // Newly added pages are discovered automatically and appended in path order.
    const previous = JSON.parse(readFileSync(new URL("./subscription-order.json", import.meta.url), "utf8"));
    const order = [...new Set([...previous, ...[...pages.keys()].sort()])];
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const result = [`! Generated: ${date} ${time}`];
    for (const page of order) {
      if (page === "abp-testcase-subscription.txt" || (specificPages && !specificPages.includes(page))) {
        continue;
      }
      const filters = pages.get(page);
      if (filters?.length) {
        result.push("", `! ${page}`, ...filters);
      }
    }
    return result.join("\n");
  }

  return {
    get_filters,
    reset() {
      requests.length = 0;
    },
    async complete({ results, outputMode }) {
      const pages = new Map(
        results.map(({ inputPath, content }) => [
          relative("pages", inputPath)
            .split(sep)
            .join("/")
            .replace(/\.njk$/, ""),
          extractFilters(content),
        ]),
      );
      const replacements = requests.map(({ marker, specificPages }) => [marker, collect(pages, specificPages)]);
      for (const result of results) {
        let content = result.content;
        for (const [marker, filters] of replacements) {
          content = content.replaceAll(marker, () => filters);
        }
        if (content !== result.content) {
          result.content = content;
          if (outputMode === "fs") {
            await writeFile(result.outputPath, content);
          }
        }
      }
    },
  };
}
