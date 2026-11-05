# testpages.adblockplus.org web content

The web content of the [abptestpages.org domain](https://abptestpages.org/)
is automatically generated from the files in this repository.

See [ARCHITECTURE.md](ARCHITECTURE.md) for a full overview of the project structure, Eleventy pipeline, and test infrastructure.

## Getting started

The following tools are needed:

- Node >= 22
- npm >= 10
- Docker
- `unzip` on Linux and macOS, needed by get-browser-binary to install Chromium
  and Chrome for Testing when running the tests outside of Docker

### Local setup

[mise](https://mise.jdx.dev) is optional: running `mise install` in the
repository root installs the Node and pre-commit versions pinned in
`mise.toml`. The same tools can also be installed manually at those versions.

The repository uses [pre-commit](https://pre-commit.com) to run the same
security scanners as CI (semgrep and gitleaks) plus ESLint before each commit.
Install pre-commit, then enable the hooks once:

```shell
pre-commit install
```

`pre-commit run --all-files` runs every hook on demand. The ESLint hook is
skipped until `npm install` has been run. Two manual hooks scan the whole tree
and the full git history for secrets:

```shell
pre-commit run gitleaks-current --hook-stage manual
pre-commit run gitleaks-history --hook-stage manual
```

### Build and serve with Eleventy

Install dependencies and build the site with Node alone:

```shell
npm ci
npm run build
npm run serve
```

Open http://localhost:5001/en/. The preview watches templates and rebuilds on
changes. Output goes to `build/`: pages have extensionless paths such as
`en/filters/blocking`, static assets are copied to the root, and the filter
subscription is `en/abp-testcase-subscription.txt`. Set `SITE_URL` when building
to point filters at a different server (default: `http://localhost:5001`).
The preview uses HTTP; use the Docker nginx server for HTTPS and endpoint proxying.

Pages are Nunjucks `.njk` templates in `pages/`, with YAML front matter:

```njk
---
layout: testcase.njk
title: My test
description: Check a filter.
---
{% set case = "Basic usage" %}
{{ heading(case) }}
```

Layouts live in `templates/` and insert `{{ content|safe }}`. Shared fragments
in `includes/` use `{% include "head.njk" %}`. The JavaScript globals are
`get_id`, `heading`, `get_filters`, `get_date`, and `site_url`; filters are
`domain`, `strip_proto`, and `build_wildcard_filter`. They are registered in
`eleventy.config.js`.

To add a page, create `pages/<category>/<name>.njk` with front matter and test
sections, then link to `<category>/<name>` from `pages/index.njk`. Keep filter
rules in `.testcase-filters pre` or `.site-panel pre` so `get_filters()`
includes them in the subscription. See [ARCHITECTURE.md](ARCHITECTURE.md) for
the test section structure.

## Running the tests

The execution is done in Docker.

### Lint

Checks are done using:

- npm `linthtml` for html content
- npm `eslint` for javascript content
- npm `stylelint` for CSS content
- npm `prettier` for code formatting

Run all JS/CSS/HTML linters locally:

```shell
npm run lint
```

Auto-fix all fixable issues:

```shell
npm run lint-fix
```

To run the full lint image (including YAML checks):

```shell
docker build -t lintimage -f test/lint.Dockerfile .
docker run -it lintimage
```

### Page tests

Tests can be executed with:

```shell
docker build -t testpages .
docker run --shm-size=2g -it testpages
```

#### Grep

`firefox latest` is the default browser. Other browsers can be run using the
`GREP` argument:

```shell
docker run --shm-size=2g -e GREP="chrome latest" -it testpages
```

The available browsers are:

- chromium 127.0.6533.0 (oldest supported version, MV2)
- chromium 128.0.6613.0 (latest chromium version supporting MV2 extensions)
- chrome latest
- chrome beta
- chrome dev
- firefox latest
- firefox beta
- firefox 128.0 (oldest supported version)
- edge latest
- edge beta

`GREP` supports regular expressions syntax, which means it can be extended to
run a subset of those tests. Example:

```shell
docker run --shm-size=2g -e GREP="chrome latest.*(Blocking|Popup)" -it testpages
```

To exclude a subset of the tests, use a negative regular expression. Example:

```shell
docker run --shm-size=2g -e GREP="^.*chrome latest((?\!Snippets).)*\$" -it testpages
```

#### Packed extensions

The default extension used to run the tests is the one matching the `master`
revision of `adblockplusui/adblockpluschrome`. Other packed extensions may be
used by providing the `EXTENSION_FILE` argument when building the image.
Example:

```shell
docker build -t testpages --build-arg EXTENSION_FILE="adblockpluschrome-*.zip" .
```

Running the tests with a custom extension needs the `SKIP_EXTENSION_DOWNLOAD`
argument to be set to `true`, otherwise the custom extension would be overridden
by the default extension. Example:

```shell
docker run --shm-size=2g -e SKIP_EXTENSION_DOWNLOAD="true" -it testpages
```

Any ad blocking extension can be used to run automated tests on testpages, as
long as it provides the following APIs:

- `subscriptions.get(ignoreDisabled, downloadable)` - returning subscriptions urls
- `subscriptions.remove(url)` - removing subscription with provided url
- `filters.get` - listing all filters available for user
- `filters.remove(text)` - removing filter with provided text
- `filters.importRaw(text)` - adding filter in a raw format with text specified
- `debug.getLastError` - returning last error thrown in extension console
- `testing.getReadyState` - returning "started" when the extension is ready to
  interact with. Only ABP is expected to implement this interface

The default behavior for `debug.getLastError` is to log a warning. That can be
changed to throw an actual error by setting the `THROW_LAST_ERROR` argument to
`true`. Example:

```shell
docker run --shm-size=2g -e THROW_LAST_ERROR="true" -it testpages
```

#### Running tests against an external server

By default, Docker starts a local nginx server and endpoints server inside the
container, then runs tests against them. Three environment variables control
this behaviour:

- `START_LOCAL_SERVERS` — set to `false` to skip starting the local nginx and
  endpoints servers inside the container. Useful when pointing tests at an
  already-running server. Defaults to `true`.
- `TEST_PAGES_URL` — the base URL the test runner uses. Defaults to
  `https://local.testpages.adblockplus.org:5001/en/`. Override this to test
  against a different server, e.g. the production site or a remote environment.
- `TEST_PAGES_INSECURE` — set to `true` to allow connections to servers with
  self-signed or otherwise untrusted SSL certificates. Defaults to `true`
  because the local nginx server uses a self-signed certificate. Set to `false`
  when testing against a server with a valid certificate.

Example — run tests against an already-running external server:

```shell
docker run --shm-size=2g \
  -e START_LOCAL_SERVERS="false" \
  -e TEST_PAGES_URL="https://abptestpages.org/en/" \
  -e TEST_PAGES_INSECURE="false" \
  -it testpages
```

#### Debugging failing tests

In order to access the screenshots for failing tests run the following command,
which copies the screenshots to `<destination>` folder:

```shell
docker cp $(docker ps -aqf ancestor=testpages | head -n 1):/testpages.adblockplus.org/test/screenshots <destination>
```

Another useful resource are the nginx (test pages server) logs. In order to
access them, run the following command:

```shell
docker cp $(docker ps -aqf ancestor=testpages | head -n 1):/var/log/nginx/ <destination>
```

## Browsing the site locally

To browse the rendered test pages locally add the domain `local.testpages.adblockplus.org`
to your host `/etc/hosts` once:

```
127.0.0.1 local.testpages.adblockplus.org
```

Then start the nginx server in Docker:

```sh
docker build -t testpages .
./test/start-nginx-server.sh testpages
```

The site will be available at `https://local.testpages.adblockplus.org:5001/en/`. The certificate is self-signed, so you'll need to accept the browser warning.

Note: Other local debugging tools are documented in [Local execution without Docker](docs/local-execution-without-docker.md).
