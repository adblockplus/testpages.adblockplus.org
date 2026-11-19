import { existsSync } from "node:fs";
import { get_id, heading, get_date, site_url, createFilterSubscription } from "./globals/index.js";
import { domain, strip_proto, build_wildcard_filter } from "./filters/index.js";

export default function (eleventyConfig) {
  for (const [name, value] of Object.entries({ get_id, get_date })) {
    eleventyConfig.addNunjucksGlobal(name, value);
  }
  // Mark the heading HTML safe with the rendering environment's own filter: on Windows, Eleventy
  // can load a second copy of Nunjucks, which escapes a SafeString made by the other copy.
  eleventyConfig.amendLibrary("njk", (environment) => {
    const markSafe = environment.getFilter("safe");
    environment.addGlobal("heading", (title) => markSafe(heading(title)));
  });
  const subscription = createFilterSubscription();
  eleventyConfig.addNunjucksGlobal("get_filters", subscription.get_filters);
  eleventyConfig.on("eleventy.before", subscription.reset);
  eleventyConfig.on("eleventy.after", subscription.complete);
  for (const [name, filter] of Object.entries({ domain, strip_proto, build_wildcard_filter })) {
    eleventyConfig.addNunjucksFilter(name, filter);
  }
  eleventyConfig.addGlobalData("site_url", site_url);
  eleventyConfig.addGlobalData("locale", "en");
  eleventyConfig.addPassthroughCopy({ static: "." });
  eleventyConfig.addWatchTarget("includes/");
  eleventyConfig.addWatchTarget("templates/");
  eleventyConfig.addWatchTarget("globals/");
  eleventyConfig.addWatchTarget("filters/");

  // The local preview serves the same extensionless pages as nginx.
  eleventyConfig.setServerOptions({
    indexFileName: "index",
    middleware: [
      (req, res, next) => {
        const path = new URL(req.url, "http://localhost").pathname;
        if (path === "/") {
          res.writeHead(302, { Location: "/en/" });
          res.end();
          return;
        }
        if (path.startsWith("/en/") && !path.endsWith(".txt")) {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
        }
        next();
      },
    ],
  });

  const version = Date.now();
  eleventyConfig.addTransform("page-links-and-assets", function (content) {
    // The old CMS output had no empty <head></head> in page bodies; keep the output the same.
    content = content.replace(/<head><\/head>/g, "");
    content = content.replace(/(<[\w]+\s[^<>]*\b(href|src)=")([^<>"]+)(")/g, (match, pre, attr, url, post) => {
      // Absolute, external, fragment, query-only and dot-relative URLs already have their intended target.
      if (/^(?:[a-z][\w+.-]*:|\/|\.|#|\?)/i.test(url)) {
        return match;
      }
      const path = url.split(/[?#]/)[0];
      if (existsSync(`static/${path}`)) {
        return `${pre}/${path}${post}`;
      }
      const target = url.replace(/(^|\/)index(?=[?#]|$)/, "$1");
      return `${pre}/en/${target}${post}${attr === "href" ? ' hreflang="en"' : ""}`;
    });
    return content.replace(
      /(<(?:script|img)\s[^<>]*\bsrc="\/[^"<>]+|<link\s[^<>]*\bhref="\/[^"<>]+)/g,
      `$1?${version}`,
    );
  });

  return {
    templateFormats: ["njk"],
    dir: { input: "pages", includes: "../includes", layouts: "../templates", output: "build" },
  };
}
