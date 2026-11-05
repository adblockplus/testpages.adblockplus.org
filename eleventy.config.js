import { existsSync } from "node:fs";
import nunjucks from "nunjucks";
import { get_id, heading, get_date, site_url, createFilterSubscription } from "./globals/index.js";
import { domain, strip_proto, build_wildcard_filter } from "./filters/index.js";

export default function (eleventyConfig) {
  const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader(["includes", "templates"]), {
    autoescape: true,
  });
  for (const [name, value] of Object.entries({ get_id, heading, get_date, site_url })) {
    environment.addGlobal(name, value);
  }
  const subscription = createFilterSubscription();
  environment.addGlobal("get_filters", subscription.get_filters);
  eleventyConfig.on("eleventy.before", subscription.reset);
  eleventyConfig.on("eleventy.after", subscription.complete);
  eleventyConfig.setLibrary("njk", environment);
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
    // Preserve the renderer's removal of empty head fragments from page bodies.
    content = content.replace(/<head><\/head>/g, "");
    content = content.replace(/(<[\w]+\s[^<>]*\b(href|src)=")([^<>"]+)(")/g, (match, pre, attr, url, post) => {
      // Absolute, external, fragment and dot-relative URLs already have their intended target.
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
