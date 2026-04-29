# Architecture and Maintenance

## Overview

Testpages is a website and automated test suite for verifying that ad-blocking
extensions (primarily Adblock Plus) correctly apply filters. The site is served
at [abptestpages.org](https://abptestpages.org) and each page demonstrates a
specific filter type or snippet. Automated tests load these pages in a real
browser with ABP installed, apply the relevant filters, and verify the result
by comparing screenshots.

---

## Directory Structure

### Source directories (checked in, not modified at runtime)

| Directory | Purpose |
|-----------|---------|
| `pages/` | Page content written as Jinja2 templates (`.tmpl` files). Subdirectories map to URL paths: `pages/filters/blocking.tmpl` → `/en/filters/blocking`. |
| `templates/` | Page layout templates referenced by pages via `template = <name>`. Most test pages use `testcase`, which wraps content in the standard HTML shell. |
| `includes/` | Partial HTML fragments (header, footer, head) included by templates via `<? include name ?>`. |
| `globals/` | Python functions available inside `.tmpl` files as Jinja2 globals: `get_id()`, `heading()`, `get_filters()`, `get_date()`, `site_url`, `strip_proto`, `domain`. |
| `filters/` | Python filters available in Jinja2 templates (e.g. `strip_proto`, `domain`). Separate from ad-blocking filters. |
| `static/` | Static assets served as-is: `static/lib/` (shared JS utilities), `static/css/`, `static/images/`, `static/testfiles/` (per-test JS and HTML used by test pages). |
| `endpoints/` | Small Node.js servers that handle requests requiring dynamic server-side logic (sitekey signing, WebSocket echo, etc.). Started alongside nginx during test runs. |
| `test/` | All test infrastructure: Selenium test runner, Docker/nginx config, CI entrypoint script. |
| `test/extension-tests/` | The Mocha test suite that drives a real browser via Selenium WebDriver. |
| `test/extension-tests/helper-extension/` | Source for the MV2/MV3 helper extension used as a second loaded extension during tests. Built before the test run. |
| `testext/` | The unpacked ABP extension used during test runs. This directory is either downloaded at runtime or populated via `EXTENSION_FILE` at Docker build time. **Not committed — populated at runtime.** |

### Notable source files

| File | Purpose |
|------|---------|
| `pages/abp-testcase-subscription.txt.tmpl` | Dynamically generated filter subscription file. `get_filters()` walks all pages and extracts filters from `.testcase-filters pre` and `.site-panel pre` elements. |

### Generated / runtime directories (not committed)

| Directory | When created | Purpose |
|-----------|-------------|---------|
| `/var/www/local.testpages.adblockplus.org/` | Docker build | Static HTML output from CMS — what nginx actually serves. |
| `test/screenshots/` | Test run (on failure) | Screenshots taken when a test fails, copied out via `docker cp`. |
| `helper-extension-build/` | Before test run | Built output of the helper extension. |
| `node_modules/` | `npm install` | JS dependencies. |

---

## How the CMS Pipeline Works

Testpages uses [eyeo's CMS](https://gitlab.com/eyeo/websites/cms) to turn
`.tmpl` source files into static HTML.

1. Each `.tmpl` file in `pages/` starts with a metadata block (key-value pairs
   before any HTML), followed by Jinja2 template content:
   ```
   title = My Test Page
   template = testcase
   description = Tests that X works.

   {% set case = "Basic usage" %}
   ...
   ```

2. The CMS reads the metadata, selects the layout from `templates/` (e.g.
   `testcase.tmpl`), injects the page body as `{{ body }}`, renders the full
   Jinja2 template with globals from `globals/` and filters from `filters/`,
   and outputs static HTML.

3. During the Docker build, `cms.bin.generate_static_pages` writes all rendered
   HTML files to `/var/www/$DOMAIN/`. nginx then serves these files for the
   duration of the test run.

4. The subscription file (`abp-testcase-subscription.txt`) is also a CMS page.
   Its body calls `{{ get_filters() }}`, which walks every page's rendered HTML
   and extracts filter text from `.testcase-filters pre` and `.site-panel pre`
   elements. This means filters must be in **static HTML** — filters injected
   by JavaScript will not appear in the subscription file.

### Key globals available in `.tmpl` files

| Global | What it does |
|--------|-------------|
| `get_id(title)` | Converts a title string to a kebab-case HTML id, e.g. `"Basic usage"` → `"basic-usage"`. Used to give each test case a stable, unique id. |
| `heading(title)` | Returns an `<h2>` element with the id and `aria-label` attributes set using `get_id()`. |
| `site_url` | The full base URL of the site (e.g. `https://local.testpages.adblockplus.org:5001`). Set via the `SITE_URL` environment variable. |
| `site_url\|domain` | The domain only (e.g. `local.testpages.adblockplus.org`). Used in filter rules. |
| `site_url\|strip_proto` | URL without the protocol prefix. Used in filter rules that require `||domain/path` syntax. |
| `get_filters()` | Used only by the subscription file template to aggregate all filters from all pages. |

---

## How Test Pages Work

### Page anatomy

A typical test page section looks like this:

```html
{% set case = "Basic usage" %}
{% set id = get_id(case) %}
<section id="{{id}}-section" class="testcase-panel">
  {{ heading(case) }}
  <p>Description of what is being tested.</p>
  <div id="{{id}}-area" class="testcase-area">
    <div class="testcase-examplecontent" aria-label="{{id}}-example">Example Content</div>
    <div class="testcase-waiting-content" aria-label="{{id}}-waiting">Waiting...</div>
  </div>
  <h3>Filters</h3>
  <ul id="{{id}}-filters" class="testcase-filters">
    <li><pre>{{ site_url|domain }}##.ad</pre></li>
  </ul>
</section>
```

### Pass/fail convention

The automated test runner compares a screenshot of the page *with* filters
applied against a screenshot of the page *in its expected state* (loaded with
`?expected=1`). Pages use a consistent visual convention:

- Elements with `data-expectedresult="fail"` are styled red — they represent
  content that should be blocked or hidden. If they remain visible after filters
  are applied, the test fails.
- Elements with `data-expectedresult="pass"` are styled green — they represent
  content that should remain visible.
- `.testcase-examplecontent` always shows the green "Example Content" placeholder.
- `.testcase-waiting-content` shows a waiting message while a delayed script runs.

For snippet tests, the JS testfile appends a red fail element after a short
delay. If the snippet is working correctly, the append is blocked and no fail
element appears.

### Static test files

JS and HTML files used by test pages live in `static/testfiles/<page-name>/`.
They are served directly by nginx. The `removeWaitingContent(targetId)` function
from `static/lib/utils.js` is available globally on all test pages and removes
`.testcase-waiting-content` elements once a test script has run.

---

## How to Add a Test Page

1. Create `pages/<category>/<name>.tmpl`. Use `template = testcase` for standard
   test pages.
2. Add one or more test case sections following the anatomy above.
3. If the page needs JS, create `static/testfiles/<name>/` and put scripts there.
   Reference them with `<script src="/testfiles/<name>/script.js"></script>`.
4. Add a link to `pages/index.tmpl` in the appropriate section, in alphabetical
   order.
5. If the test should not run in certain browsers or manifest versions, add an
   exclusion to `test/extension-tests/pages/utils.js` `isExcluded()`.

---

## How to Disable or Exclude a Test Page

There are two levels of exclusion:

**Exclude from automated test runs only** (page still renders and is accessible
on the website): add a condition to `isExcluded()` in
`test/extension-tests/pages/utils.js`. Examples of existing exclusions:

```js
// Exclude from all browsers:
else if (/^filters\/inline-css/.test(page))
  return true;

// Exclude from a specific browser:
else if (page == "exceptions/iframe")
  excluded = ["firefox"];

// Exclude based on manifest version:
else if (manifestVersion == 3 && page == "filters/header")
  return true;
```

**Force-include a page that is excluded** (useful for local debugging):

```shell
TESTS_TO_INCLUDE=filters/my-page npm test -- -g "chrome latest"
```

**Exclude from the website entirely**: remove or rename the `.tmpl` file and
remove its entry from `pages/index.tmpl`.

---

## Build and Publish Process

### Local / Docker

1. `docker build -t testpages .` — builds the Docker image. During this step:
   - nginx is installed and configured with a self-signed TLS certificate for
     `local.testpages.adblockplus.org`.
   - The CMS is cloned at a pinned commit and its dependencies installed.
   - npm dependencies are installed.
   - The CMS renders all `.tmpl` pages to static HTML in `/var/www/$DOMAIN/`.
   - If `EXTENSION_FILE` is provided, the extension is unpacked into `testext/`.

2. `docker run --shm-size=2g -it testpages` — runs the container. The
   `test/entrypoint.sh` script:
   - Starts nginx (testpages server) and the endpoints server.
   - Sets `MANIFEST_VERSION` based on `GREP` (`chrome` only, excluding `chromium` → MV3; everything else including `chromium`, `edge`, `firefox` → MV2).
   - Downloads the ABP extension unless `SKIP_EXTENSION_DOWNLOAD=true`.
   - Runs `npm test` with the `GREP` filter.

### Production publish

On merge to `master`, the CI pipeline:
1. Runs the `build_production` stage: calls
   `cms.bin.generate_static_pages` with `SITE_URL=https://abptestpages.org` to
   generate static HTML.
2. Runs the `deploy_production` stage: copies the build output to the production
   server via a deploy script.
3. Runs the `notify` stage: if any `.tmpl` files changed, triggers a pipeline in
   the test automation project to re-run tests against the live site.

---

## How the CI Test Process Works

Each browser has its own parallel CI job (e.g. `test:chrome:latest`,
`test:firefox:latest`). All jobs use the same Docker image but pass a different
`GREP` value to select the browser.

Jobs that only run on scheduled pipelines (not on push): `chrome:beta`,
`chrome:dev`, `firefox:beta`, `edge:beta`.

`test:edge:windows` is a special job that runs on a dedicated Windows runner
(`eyeo-windows`) without Docker, setting up nginx, Python, and Node.js directly
via Chocolatey.

### Test runner internals

`test/extension-tests/entrypoint.js` is the Mocha test root. It:
1. Fetches the index page of testpages and parses all test case links into a
   `pageTests` array (`[[section, [[url, title], ...]], ...]`).
2. For each browser/version combination, creates a Selenium WebDriver, loads the
   ABP extension, and waits for it to report `started` via `testing.getReadyState`.
3. Reads `manifest.json` from the extension directly to determine MV2 vs MV3.
4. Runs the test suite defined in `test/extension-tests/pages/index.js`, which
   iterates `pageTests`, applies filters from each page's `<pre>` elements, and
   compares screenshots.

### Screenshot comparison

For each test page, the runner:
1. Navigates to `<url>?expected=1` and takes a screenshot (the expected state).
2. Navigates to `<url>`, imports the page's filters into ABP, refreshes, and
   takes a screenshot.
3. Compares the two screenshots using `Jimp`. If they differ beyond a threshold,
   the test fails and the screenshots are saved to `test/screenshots/`.

For **specialized tests** (defined in `test/extension-tests/pages/specialized.js`), screenshot
comparison is replaced with custom DOM assertions.

---

## Debugging Failing Tests

**Get screenshots from a failed Docker run:**
```shell
docker cp $(docker ps -aqf ancestor=testpages | head -n 1):/testpages.adblockplus.org/test/screenshots ./screenshots
```

**Get nginx logs:**
```shell
docker cp $(docker ps -aqf ancestor=testpages | head -n 1):/var/log/nginx/ ./nginx-logs
```

**Run a single test locally:**
```shell
TEST_PAGES_URL=http://localhost:5001/en/ MANIFEST_VERSION=2 npm test -- -g "chrome latest.*Blocking"
```

**Force-include an excluded test:**
```shell
TESTS_TO_INCLUDE=filters/my-page MANIFEST_VERSION=2 npm test -- -g "chrome latest"
```

**Throw on extension errors** (turns `debug.getLastError` warnings into failures):
```shell
docker run --shm-size=2g -e THROW_LAST_ERROR="true" -it testpages
```

**View the rendered page locally**: run the CMS dev server (see README) and open
the page in a browser. Append `?expected=1` to see what the test runner expects
to see after filters are applied.

---

## Limitations

- **CMS dependency**: the site requires a pinned version of the eyeo CMS,
  cloned at build time. Changes to CMS behaviour can silently break page
  rendering.
- **`get_filters()` reads static HTML only**: filters defined using Jinja2
  page-local variables (e.g. `{{id}}`) may not resolve correctly in the
  subscription file, because `get_filters()` processes pages with the global
  context, not the page-local one. Filters should always use hardcoded strings
  or global variables (`site_url`).
- **Screenshot comparison is pixel-sensitive**: font rendering differences
  between browser versions or platforms can cause false failures. The
  `browser-snapshots/` directory holds reference screenshots per browser.
- **No parallelism within a browser**: Selenium WebDriver requires sequential
  script execution on a single driver instance. Tests within a browser run
  serially.
- **Self-signed certificate**: the test server uses a self-signed TLS
  certificate. Node.js `fetch` calls from outside the browser context will
  reject it — use `driver.executeAsyncScript` with `fetch` inside the browser
  instead.
- **Subscription test requires HTTPS**: the `subscribes to a link` test will
  fail on a local CMS `runserver.py` setup because it serves over HTTP, not
  HTTPS.
- **Windows CI is manual setup**: the `test:edge:windows` job does not use
  Docker. It installs dependencies via Chocolatey on each run, making it slower
  and more fragile than the Linux jobs.
