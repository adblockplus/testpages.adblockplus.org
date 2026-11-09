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

| Directory                                | Purpose                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/`                                 | Page content written as Nunjucks templates with YAML front matter (`.njk` files). Subdirectories map to URL paths: `pages/filters/blocking.njk` → `/en/filters/blocking`.                                                                                                                                                                                                 |
| `templates/`                             | Page layout templates referenced by pages via `layout: <name>.njk`. Most test pages use `testcase`, which wraps content in the standard HTML shell.                                                                                                                                                                                                                       |
| `includes/`                              | Partial HTML fragments (header, footer, head) included by templates via `{% include "name.njk" %}`.                                                                                                                                                                                                                                                                       |
| `globals/`                               | JavaScript functions available inside `.njk` files as Nunjucks globals: `get_id()`, `heading()`, `get_filters()`, `get_date()`, `site_url`.                                                                                                                                                                                                                               |
| `filters/`                               | JavaScript filters available in Nunjucks templates (e.g. `strip_proto`, `domain`). Separate from ad-blocking filters.                                                                                                                                                                                                                                                     |
| `static/`                                | Static assets served as-is: `static/lib/` (shared JS utilities), `static/css/`, `static/images/`, `static/testfiles/` (per-test JS and HTML used by test pages).                                                                                                                                                                                                          |
| `endpoints/`                             | Small Node.js servers that handle requests requiring dynamic server-side logic (sitekey signing, WebSocket echo, etc.). Started alongside nginx during test runs.                                                                                                                                                                                                         |
| `test/`                                  | All test infrastructure: Selenium test runner, Docker/nginx config, CI entrypoint script.                                                                                                                                                                                                                                                                                 |
| `test/extension-tests/`                  | The Mocha test suite that drives a real browser via Selenium WebDriver.                                                                                                                                                                                                                                                                                                   |
| `test/extension-tests/helper-extension/` | Source for the MV2/MV3 helper extension used as a second loaded extension during tests. Built before the test run.                                                                                                                                                                                                                                                        |
| `testext/`                               | The unpacked ABP extension used during test runs. Populated in one of two ways: (1) at runtime by `node ./test/extension-tests/extension-download.js` (default, downloads the latest ABP release), or (2) at Docker build time when the `EXTENSION_FILE` build arg is provided (`docker build --build-arg EXTENSION_FILE=...`). **Not committed — populated at runtime.** |

### Notable source files

| File                                      | Purpose                                                                                                                                                           |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/abp-testcase-subscription.txt.njk` | Dynamically generated filter subscription file. `get_filters()` walks all pages and extracts filters from `.testcase-filters pre` and `.site-panel pre` elements. |

### Generated / runtime directories (not committed)

| Directory                                   | When created          | Purpose                                                          |
| ------------------------------------------- | --------------------- | ---------------------------------------------------------------- |
| `/var/www/local.testpages.adblockplus.org/` | Docker build          | Static HTML output from Eleventy — what nginx actually serves.   |
| `test/screenshots/`                         | Test run (on failure) | Screenshots taken when a test fails, copied out via `docker cp`. |
| `helper-extension-build/`                   | Before test run       | Built output of the helper extension.                            |
| `node_modules/`                             | `npm install`         | JS dependencies.                                                 |

---

## How the Eleventy Pipeline Works

The build needs Node 22 and npm 10 or newer. Run `npm ci`, then `npm run build`
to render the site into `build/`. Run `npm run serve` for a watching preview at
http://localhost:5001/en/. Set `SITE_URL` to change the URL embedded in filter
rules (default: `http://localhost:5001`). See
[Local execution without Docker](docs/local-execution-without-docker.md).

1. Each `.njk` file in `pages/` starts with YAML front matter followed by
   Nunjucks template content:

   ```njk
   ---
   title: My Test Page
   layout: testcase.njk
   description: Tests that X works.
   ---
   {% set case = "Basic usage" %}
   {{ heading(case) }}
   ```

2. Eleventy renders the body, then the selected Nunjucks layout in
   `templates/`, which inserts `{{ content|safe }}`. Shared fragments in
   `includes/` use `{% include "head.njk" %}`. JavaScript globals and filters
   are registered in `eleventy.config.js`. Computed metadata can use
   `eleventyComputed` in front matter, as in the CSP Specific page.
3. `pages/pages.11tydata.js` keeps the output paths extensionless under `en/`.
   `static/` is copied to the output root. A transform rewrites relative page
   links to `/en/…` with `hreflang="en"`, resolves static links to the root,
   and versions root-relative script, link and image URLs with the build time.
4. The subscription page calls `get_filters()`, reserving a placeholder until
   the `eleventy.after` event supplies the completed page output, including
   layouts, the data cascade, computed metadata and transforms. An HTML parser
   extracts the text of `.testcase-filters pre` and `.site-panel pre` elements,
   preserving line breaks and decoding entities. The event replaces the
   placeholder with these rules and page comments and writes the subscription.
   `globals/subscription-order.json` preserves the published subscription's
   historical page order; new pages are discovered automatically and appended
   in path order. A page with no filters contributes nothing. Filters inserted
   by browser JavaScript are not part of the subscription.
5. Docker runs the same build with output set to `/var/www/$DOMAIN/`.
   Production CI builds `build/` and passes it to the existing deploy job.
   A rendering error stops the build before deployment.

### Key globals available in `.njk` files

| Global or filter              | What it does                                                    |
| ----------------------------- | --------------------------------------------------------------- |
| `get_id(title)`               | Makes a stable HTML id from a title.                            |
| `heading(title)`              | Returns a safe h2 with the id and test-case aria-label.         |
| `get_date()`                  | Returns the build date for the footer.                          |
| `get_filters(specific_pages)` | Collects the subscription rules; optionally selects page paths. |
| `site_url`                    | The base URL from `SITE_URL`.                                   |
| `domain`                      | Extracts the hostname from a URL.                               |
| `strip_proto`                 | Removes a URL's protocol prefix.                                |
| `build_wildcard_filter`       | Converts a hostname to its wildcard filter domain.              |

---

## How Test Pages Work

### Page anatomy

A typical test page section looks like this:

```html
{% set case = "Basic usage" %} {% set id = get_id(case) %}
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

The automated test runner compares a screenshot of the page _with_ filters
applied against a screenshot of the page _in its expected state_ (loaded with
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

1. Create `pages/<category>/<name>.njk`. Use YAML front matter with `layout: testcase.njk`, `title` and `description` for standard
   test pages.
2. Add one or more test case sections following the anatomy above.
3. If the page needs JS, create `static/testfiles/<name>/` and put scripts there.
   Reference them with `<script src="/testfiles/<name>/script.js"></script>`.
4. Add a link to `pages/index.njk` in the appropriate section, in alphabetical
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

**Exclude from the website entirely**: remove or rename the `.njk` file and
remove its entry from `pages/index.njk`.

---

## Build and Publish Process

### Local / Docker

1. `docker build -t testpages .` — builds the Docker image. During this step:
   - nginx is installed and configured with a self-signed TLS certificate for
     `local.testpages.adblockplus.org`.
   - npm dependencies are installed with `npm ci`.
   - Eleventy renders all `.njk` pages to static HTML in `/var/www/$DOMAIN/`.
   - If `EXTENSION_FILE` is provided, the extension is unpacked into `testext/`.

2. `docker run --shm-size=2g -it testpages` — runs the container. The
   `test/entrypoint.sh` script:
   - Starts nginx (testpages server) and the endpoints server.
   - Sets `MANIFEST_VERSION` based on `GREP` (`chrome` only, excluding `chromium` → MV3; everything else including `chromium`, `edge`, `firefox` → MV2).
   - Downloads the ABP extension unless `SKIP_EXTENSION_DOWNLOAD=true`.
   - Runs `npm test` with the `GREP` filter.

### Production publish

On merge to `master`, the CI pipeline:

1. Runs `build:abptestpages` in the `build_production` stage, on the
   `eyeo-medium-runner` Docker runner with `node:22`. It runs `npm ci` and
   `npm run build` with `SITE_URL=https://abptestpages.org`, publishing
   `build/` as an artifact. The job also runs on other branches, so a broken
   production build fails before merge.
2. Runs `deploy:abptestpages`, which depends on that artifact and retains
   the production server runner and existing deploy script. Only this job is
   limited to `master`.

The endpoints server needs only the packages under `dependencies` in
`package.json` (`express` and `ws`). The build and test tooling, including
Eleventy and Nunjucks, are `devDependencies`, so `npm ci --omit=dev` installs
exactly what the endpoints need at runtime.

---

## How the CI Test Process Works

Each browser has its own parallel CI job (e.g. `test:chrome:latest`,
`test:firefox:latest`). All jobs use the same Docker image but pass a different
`GREP` value to select the browser.

Jobs that only run on scheduled pipelines (not on push): `chrome:beta`,
`chrome:dev`, `firefox:beta`, `edge:beta`.

`test:edge:windows` is a special job that runs on a dedicated Windows runner
(`eyeo-windows`) without Docker, setting up nginx directly via Chocolatey.
Pages are built with `npm run build`.

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

**View the rendered page locally**: run `npm run serve` (see README) and open
the page in a browser. Append `?expected=1` to see what the test runner expects
to see after filters are applied.

---

## Limitations

- **`get_filters()` reads build-time HTML only**: filters injected by browser
  scripts do not appear in the subscription.
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
  fail on the local Eleventy preview because it serves over HTTP, not
  HTTPS.
- **Windows CI is manual setup**: the `test:edge:windows` job does not use
  Docker. It installs dependencies via Chocolatey on each run, making it slower
  and more fragile than the Linux jobs.
