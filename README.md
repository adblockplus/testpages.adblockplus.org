# testpages.adblockplus.org web content

The web content of the [testpages.adblockplus.org domain](https://testpages.adblockplus.org/)
is automatically generated from the files in this repository.

## Getting started

The following tools are needed:
* Node >= 16.10.0
* npm >= 7
* Python 2.7
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

#### Browser

`firefox latest` is the default browser. Other browsers can be run using the
`BROWSER` argument:

```shell
docker run -e BROWSER="chromium latest" -it testpages
```

The available browsers are:
* chromium latest
* chromium beta
* chromium 77.0.3865.0
* firefox latest
* firefox beta
* firefox 68.0

#### Tests subset

In order to run a subset of the tests, use the `TESTS_SUBSET` argument,
which supports regular expressions syntax. Example:

```shell
docker run -e TESTS_SUBSET="(Blocking|Popup)" -it testpages
```

To exclude a subset of the tests, use the `TESTS_EXCLUDE` argument. Example:

```shell
docker run -e TESTS_EXCLUDE="Snippets" -it testpages
```

Note: When `TESTS_EXCLUDE` is set, then `TESTS_SUBSET` has no effect.

#### Packed extensions

The default extension used to run the tests is the one matching the `master`
revision of `adblockplusui/adblockpluschrome`. Other packed extensions may be
used by providing the `EXTENSION_FILE` argument when building the image.
Example:

```shell
docker build -t testpages --build-arg EXTENSION_FILE="adblockpluschrome-*.zip" .
```

To run the tests with the custom extension package, you must provide the
`SKIP_EXTENSION_DOWNLOAD` argument set to `true`, otherwise the custom extension
will be overridden by the default extension. Example:

```shell
docker run -e SKIP_EXTENSION_DOWNLOAD="true" -e BROWSER="chromium" -it testpages
```

#### Custom extensions

An extension with a custom `adblockpluscore` revision can be obtained with the
following commands:

```shell
docker build --build-arg ABPCORE_TAG=0.5.0 -t extensionimage -f test/generateExtension.Dockerfile .
docker container create --name extgen extensionimage
docker cp extgen:/adblockplusui/adblockpluschrome/adblockpluschrome.zip ./
```

The custom extension will be available as `adblockpluschrome.zip`.

`ABPCORE_TAG` values can be found [here](https://gitlab.com/eyeo/adblockplus/abc/adblockpluscore/-/tags).

Note: If the `adblockpluscore` revision has breaking changes it might not be
possible to build the extension with it (or it won't be working properly).

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
git -C cms checkout 8bd1d07605d220be45f907260bbbf108c3fe41ca
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
