"use strict";

// Original idea:
// https://javascript.plainenglish.io/generate-static-sites-using-nunjucks-and-gulp-298fab58b9e3

const fs = require("fs");
const gulp = require("gulp");
const nunjucksRender = require("gulp-nunjucks-render");

let distFolder = "dist";

function getId(title) {
  return title.toLowerCase().replace(/[\W_]+/g, "-");
}

let manageEnv = function(env) {
  env.addGlobal("get_date", () => (new Date()).toDateString());
  env.addGlobal("get_id", getId);
  env.addGlobal("site_url", process.env.SITE_URL || "http://localhost:4000");
  env.addGlobal("heading", title => {
    let id = getId(title);
    let heading = `<h2 aria-label="test-case-${id}" id="${id}">${title}</h2>`;
    return env.filters.safe(heading);
  });
  env.addFilter("strip_proto", url => url.split("://")[1]);
  env.addFilter("domain", url => url.split("://")[1].split(":")[0]);

  env.addGlobal("get_filters", () => {
    // implement cms.list_pages
    return "TODO";
  });
};

function clean() {
  return fs.promises.rm(distFolder, {force: true, recursive: true});
}

async function html() {
  // On production html files don't have the `.html` extension
  let ext = process.env.LOCAL_BUILD == "true" ? ".html" : "";
  await gulp.src("**/*.tmpl").pipe(nunjucksRender({
    path: ["pages/filters/", "includes/", "templates/"],
    manageEnv,
    ext
  })).pipe(gulp.dest(distFolder));
  await gulp.src(["static/**/*"]).pipe(gulp.dest(distFolder));
}

// function watchFiles() {
//     watch('src/html/**/*', html)
// }

exports.build = gulp.series(clean, html);
// exports.default = series(clean, html, watchFiles)
