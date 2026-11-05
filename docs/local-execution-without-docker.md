## Local execution without Docker

Build and preview the site with Node 22 and npm 10 or newer:

```shell
npm ci
npm run build
npm run serve
```

Open http://localhost:5001/en/. Eleventy watches the Nunjucks templates and
rebuilds on changes. `build/` contains extensionless pages under `en/`, the
subscription file, and static assets copied to the root.

Pages live in `pages/<category>/<name>.njk`. To add one, start with YAML front
matter containing `layout: testcase.njk`, `title` and `description`, then add
Nunjucks test sections. Link it from `pages/index.njk`. Layouts in `templates/`
insert `{{ content|safe }}`, and include shared fragments with
`{% include "head.njk" %}`. `eleventy.config.js` registers JavaScript globals
`get_id`, `heading`, `get_filters`, `get_date` and `site_url`, and filters
`domain`, `strip_proto` and `build_wildcard_filter`. Put subscription rules
in `.testcase-filters pre` or `.site-panel pre` elements.

Start the endpoints server in another terminal, available at http://localhost:4000:

```shell
npm run start-endpoints
```

To build and preview with filters pointing to a specific domain:

```shell
SITE_URL=http://local.abptestpages.org:5001 npm run serve
```

The default `SITE_URL` is `http://localhost:5001`. Rebuild when it changes.

If you wish to test Domain Wildcard scenario locally, you need to
start browser from command line and map ports to `local.abptestpages.org` (filters are already
pointing to this domain).
This works for Chromium browser only (excute command on the folder where browser binary
is).

On Mac:

```shell
open Chromium.app --args --host-resolver-rules="MAP local.abptestpages.org localhost:5001"
```

On Linux:
You may need to use `chromium` or `google-chrome` based on your distribution.

```shell
chromium --args --host-resolver-rules="MAP local.abptestpages.org localhost:5001"
```

On Windows:
For a default installation on a 64-bit system.

```shell
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --host-resolver-rules="MAP local.abptestpages.org localhost:5001"
```

### Local page tests run

It may be useful to run page tests outside docker, for debugging purposes.

Besides having both Eleventy and endpoint servers running, the test runner expects an
unpacked ABP extension to be located in the `./testext` folder. That can be
achieved by downloading the latest ABP release:

```shell
MANIFEST_VERSION={2|3} node ./test/extension-tests/extension-download.js
```

Note: It is also possible to manually extract a different ABP version into the
`./testext` folder.

After that, tests are ready to run. Please notice the `TEST_PAGES_URL`
environment variable needs to point to the local Eleventy preview, if you wish to test
on abptestpages.org then don't provide that variable.

Additionally, `MANIFEST_VERSION` needs to be set, matching the manifest version
of the extensions that was unpacked into the `./testext` folder.

Example:

```shell
TEST_PAGES_URL=http://localhost:5001/en/ MANIFEST_VERSION={2|3} npm test -- -g "chrome latest"
```

If testpage is excluded from execution in:
`/test/extension-tests/pages/utils.js`and you want to unskip it, you
can define environment variable to force unskip.

```shell
TESTS_TO_INCLUDE=filters/wildcard-domain MANIFEST_VERSION={2|3} npm test -- -g "chrome latest"
```

Notes:

- The `subscribes to a link` test case is expected to fail on the local run,
  because it requires an `https` server which the Eleventy preview does not provide.
- The `Sitekey` and `WebSocket` test cases are also expected to fail locally,
  because they require a request redirection to http://localhost:4000 and
  http://localhost:4001 which the Eleventy preview does not provide.
