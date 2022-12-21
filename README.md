# testpages.adblockplus.org web content

The web content of the [testpages.adblockplus.org domain](https://testpages.adblockplus.org/)
is automatically generated from the files in this repository.

## Getting started

The following tools are needed:
* Node >= 16.10.0
* npm >= 7
* Python 3
* Docker

## Running the tests

The execution is done in Docker.

### Lint

Checks are done using:
* `flake8` with the [flake8-eyeo extension](https://gitlab.com/eyeo/auxiliary/eyeo-coding-style/-/tree/master/flake8-eyeo)
for python scripts
* npm `linthtml` for html content
* npm `eslint` for javascript content
* npm `stylelint` for CSS content

To run the lint image:

```shell
docker build -t lintimage -f test/lint.Dockerfile .
docker run -it lintimage
```

### Page tests

Tests can be executed with:

```shell
docker build -t testpages .
docker run -it testpages
```

Note: it might happen that tests are crashing due to insufficient memory on
docker (tests will fail on `abort-on-property-write` with error related to
session id). To fix this you need to increase shm memory:

```shell
docker run --shm-size=256m -t testpages .
```

#### Grep

`firefox latest` is the default browser. Other browsers can be run using the
`GREP` argument:

```shell
docker run -e GREP="chromium latest" -it testpages
```

The available browsers are:
* chromium latest
* chromium beta
* chromium dev
* chromium 77.0.3865.0
* firefox latest
* firefox beta
* firefox 75.0
* firefox 68.0
* edge latest

`GREP` supports regular expressions syntax, which means it can be extended to
run a subset of those tests. Example:

```shell
docker run -e GREP="chromium latest.*(Blocking|Popup)" -it testpages
```

To exclude a subset of the tests, use a negative regular expression. Example:

```shell
docker run -e GREP="^.*chromium latest((?\!Snippets).)*\$" -it testpages
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
docker run -e SKIP_EXTENSION_DOWNLOAD="true" -it testpages
```

Any ad blocking extension can be used to run automated tests on testpages, as
long as it provides the following APIs:

* `subscriptions.get(ignoreDisabled, downloadable)` - returning subscriptions urls
* `subscriptions.remove(url)` - removing subscription with provided url
* `filters.get` - listing all filters available for user
* `filters.remove(text)` - removing filter with provided text
* `filters.importRaw(text)` - adding filter in a raw format with text specified
* `debug.getLastError` - returning last error thrown in extension console

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

## Local testpages execution

Test pages run through the CMS test server. That project needs to be cloned:

```shell
git clone https://gitlab.com/eyeo/websites/cms.git
git -C cms checkout fbd1527b9f98d99a8b62c6ad5e32ac7758c19a28
```

After that, CMS dependencies need to be installed:

```shell
pip install -r <CMS_PATH>/requirements.txt
```

Finally, to start the CMS server run the following command from the testpages
project root folder:

```shell
python <CMS_PATH>/runserver.py --port 5001
```

Test pages should now be accessible at http://localhost:5001.

Note: The local testpages server does not have sitescripts enabled, that's why
the Sitekey test is expected to fail.

For more information and usage instructions see [CMS documentation](https://gitlab.com/eyeo/websites/cms/-/blob/master/README.md).

### Local page tests run

It may be useful to run page tests outside docker, for debugging purposes.

Besides running the local testpages server, the test runner expects an unpacked
ABP extension to be located in the `./testext` folder. That can be achieved by
downloading the latest ABP release:

```shell
node ./test/extension-tests/extension-download.js
```

Note: It is also possible to manually extract a different ABP version into the
`./testext` folder.

After that, tests are ready to run. Please notice the `TEST_PAGES_URL`
environment variable needs to point to the local testpages server:

```shell
TEST_PAGES_URL=http://localhost:5001 npm test -- -g "chromium latest"
```

Note: The `subscribes to a link` test case is expected to fail on the local run,
because it requires an `https` server which `runserver.py` does not provide.
