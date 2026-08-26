# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This is a test and demonstration site for the Adblock Plus browser extension, hosted at https://abptestpages.org. It serves as:

1. A public website showing ABP functionality examples
2. An automated Selenium-based test harness that verifies ad-blocking filters work across browsers (Chrome, Firefox, Edge) and manifest versions (MV2/MV3)

## Common Commands

### Linting

```bash
npm run lint         # Run all linters (linthtml, stylelint, eslint, prettier)
npm run lint-fix     # Auto-fix all fixable issues (eslint, stylelint, prettier)
```

Individual linters:

```bash
npm run eslint       # Lint JS in test/extension-tests/, endpoints/, static/, pages/
npm run linthtml     # Lint HTML/template files
npm run stylelint    # Lint CSS and HTML stylesheets
```

All lints together (via Docker):

```bash
docker build -t lintimage -f test/lint.Dockerfile .
docker run -it lintimage
```

### Browsing the site locally

To browse the rendered test pages in your host browser without running tests:

```bash
docker build -t testpages .
./test/start-nginx-server.sh
```

The script accepts an optional image name argument (default: `testpages`). Add the domain to your host `/etc/hosts` once:

```
127.0.0.1 local.testpages.adblockplus.org
```

The site will be available at `https://local.testpages.adblockplus.org:5001/en/`. The certificate is self-signed, so you'll need to accept the browser warning.

### Running Tests

Tests require a running CMS server and endpoints server. The easiest way is Docker:

```bash
docker build -t testpages .
docker run --shm-size=2g -it testpages
```

To run a filtered subset of tests (e.g. only Blocking tests on Chrome):

```bash
docker run --shm-size=2g -e GREP="chrome latest.*Blocking" -it testpages
```

Locally (requires CMS at `http://localhost:5001/en/` and endpoints running):

```bash
npm run start-endpoints   # Start helper servers (HTTP :4000, WS :4001/:4002)
TEST_PAGES_URL=http://localhost:5001/en/ MANIFEST_VERSION=2 npm test -- -g "chrome latest.*Blocking"
```

Three `docker run` environment variables control server behaviour:

- `START_LOCAL_SERVERS` — set to `false` to skip starting the local nginx and endpoints servers inside the container (useful when pointing at an external server). Defaults to `true`.
- `TEST_PAGES_URL` — base URL used by the test runner. Defaults to `https://local.testpages.adblockplus.org:5001/en/`.
- `TEST_PAGES_INSECURE` — set to `true` to allow self-signed/untrusted SSL certificates. Defaults to `true` (matches the self-signed cert on the local nginx server). Set to `false` when testing against a server with a valid certificate.

To force-include tests that are excluded for a browser:

```bash
TESTS_TO_INCLUDE=filters/my-page npm test -- -g "chrome latest"
```

## Architecture

### CMS-Based Static Site

Pages are written as Jinja2 templates (`.tmpl` files) in `pages/`. A Python-based CMS (external dependency, cloned separately) renders them into static HTML. The CMS pipeline:

1. Reads metadata + Jinja2 body from `pages/*.tmpl`
2. Wraps body in layout from `templates/` (e.g. `testcase.tmpl`)
3. Resolves `includes/` HTML fragments (header, footer, etc.)
4. Applies `globals/` Python functions (`get_id()`, `heading()`, `get_filters()`, `site_url`, etc.)
5. Applies `filters/` Jinja2 filters (`domain`, `strip_proto`)

The `abp-testcase-subscription.txt.tmpl` page is special — it calls `get_filters()` which scrapes all `<pre>` filter rules from every rendered page to build the ABP subscription file.

### Test Execution Flow

1. Selenium loads an unpacked ABP extension + a helper extension (built from `test/extension-tests/helper-extension/`) into the browser
2. `test/extension-tests/entrypoint.js` parses the test page index to enumerate all test case links, then iterates over browser versions
3. For each test page, the runner navigates to `?expected=1` to capture an expected screenshot, then applies filters from `<pre>` elements into ABP, refreshes, and captures an actual screenshot
4. Screenshots are pixel-diffed using Jimp; failures are saved to `test/screenshots/`
5. Some tests (`test/extension-tests/pages/specialized.js`) use DOM assertions instead of screenshots (subscription tests, pop-up tests, CSP tests)

### Test Exclusions

To skip tests for specific browsers or manifest versions, edit the `isExcluded()` function in `test/extension-tests/pages/utils.js`.

### Endpoints Server

`endpoints/start.js` runs three servers needed by certain test pages:

- HTTP server (`:4000`) — sitekey signing and other responses
- WebSocket echo servers (`:4001`, `:4002`)

### Test Page Structure

Each test section follows this pattern in `.tmpl` files:

```html
{% set case = "Basic usage" %} {% set id = get_id(case) %}
<section id="{{id}}-section" class="testcase-panel">
  {{ heading(case) }}
  <div id="{{id}}-area" class="testcase-area">
    <div class="testcase-examplecontent" data-expectedresult="fail">Ad Element</div>
    <div class="testcase-waiting-content">Waiting...</div>
  </div>
  <ul id="{{id}}-filters" class="testcase-filters">
    <li><pre>{{ site_url|domain }}##.ad</pre></li>
  </ul>
</section>
```

- `data-expectedresult="fail"` → element should be blocked/hidden (shown in red in expected view)
- `data-expectedresult="pass"` → element should remain visible (shown in green)

### Helper Extension (MV2/MV3)

`test/extension-tests/helper-extension/` provides a polyfill extension built before tests run. It supports both MV2 and MV3 via separate `manifest.json` files; the correct one is selected based on `MANIFEST_VERSION`.

## Code Style

- ESLint extends `eslint:recommended` + `eslint-config-prettier`; `curly: all`
- Prettier handles formatting (`.prettierrc.js`); scope controlled via `.prettierignore`
- HTML/templates: indent-width 2 (linthtml)
- Python: flake8 with flake8-eyeo

## CI Notes

- On `master` push: lint → multi-browser tests in parallel → build static HTML → deploy to abptestpages.org
- Scheduled pipeline only: Chrome beta/dev, Firefox beta, Edge beta
- If `.tmpl` files change, CI triggers the external test automation pipeline
- Windows Edge tests (`test:edge:windows`) run without Docker on a dedicated Windows runner
