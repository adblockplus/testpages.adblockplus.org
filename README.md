# testpages.adblockplus.org web content

The web content of the [abptestpages.org domain](https://abptestpages.org/)
is automatically generated from the files in this repository.

See [ARCHITECTURE.md](ARCHITECTURE.md) for a full overview of the project structure, CMS pipeline, and test infrastructure.

## Getting started

The following tools are needed:

- Node >= 22
- npm >= 10
- Python 3
- Docker

## Running the tests

The execution is done in Docker.

### Lint

Checks are done using:

- `flake8` with the [flake8-eyeo extension](https://gitlab.com/eyeo/auxiliary/eyeo-coding-style/-/tree/master/flake8-eyeo)
  for python scripts
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

To run the full lint image (includes Python):

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

- chromium 79.0.3945.0 (oldest supported version, MV2)
- chromium 128.0.6613.0 (latest chromium version supporting MV2 extensions)
- chrome latest
- chrome beta
- chrome dev
- firefox latest
- firefox beta
- firefox 75.0
- firefox 68.0
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
