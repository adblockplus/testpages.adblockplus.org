# testpages.adblockplus.org web content

The web content of the testpages.adblockplus.org domain is generated
automatically from the files in this repository.

## Getting started

The following tools are needed:
* Python 2.7
* Docker

## Running the tests

The execution is done in Docker.

### Lint

Checks are done using:
* `flake8` with the [flake8-eyeo extension](https://gitlab.com/eyeo/auxiliary/eyeo-coding-style/-/tree/master/flake8-eyeo)
for python scripts
* npm `htmllint-cli` for html content
* npm `eslint` for javascript content
* npm `stylelint` for CSS content

To run the lint image:
```
docker build -t lintimage -f test/lint.Dockerfile .
docker run -it lintimage
```

### Page tests

Tests can be executed with:
```
docker build -t testpages .
docker run -it testpages
```

#### Browser

`Firefox (latest)` is the default browser. Other browsers can be run using the
`BROWSER` argument:
```
docker run -e BROWSER="Chromium \(latest\)" -it testpages
```

The available browsers are:
* Chromium \(latest\)
* Chromium \(oldest\)
* Firefox \(latest\)
* Firefox \(oldest\)

#### Tests subset

In order to run a subset of the tests, use the `TESTS_SUBSET` argument,
which uses regular expressions. Example:
```
docker run -e TESTS_SUBSET="(Blocking|Popup)" -it testpages
```

#### Packed extensions

The default extension used to run the tests is the one matching the `master`
revision of `adblockplusui/adblockpluschrome`. Other packed extensions may be
used by providing the `EXTENSION_FILE` argument when building the image.
Example:
```
docker build -t testpages --build-arg EXTENSION_FILE="adblockpluschrome-*.zip" .
```

To run the tests with the custom extension package, you must provide the
`SKIP_EXTENSION_DOWNLOAD` argument set to `true`, otherwise the custom extension
will be overridden by the default extension. Example:
```
docker run -e SKIP_EXTENSION_DOWNLOAD="true" -e BROWSER="Chromium \(latest\)" -it testpages
```

#### Debugging failing tests

In order to access the screenshots for failing tests run the following command,
which copies the screenshots to `<destination>` folder:
```
docker cp $(docker ps -aqf ancestor=testpages | head -n 1):/testpages.adblockplus.org/test/screenshots <destination>
```

Another useful resource are the nginx (test pages server) logs. In order to
access them, run the following command:
```
docker cp $(docker ps -aqf ancestor=testpages | head -n 1):/var/log/nginx/ <destination>
```

## Local testpages execution

Test pages run through the CMS test server. That project needs to be cloned:
```
git clone https://gitlab.com/eyeo/websites/cms.git
```

After that, CMS dependencies need to be installed:
```
pip install -r <CMS_PATH>/requirements.txt
```

Finally, to start the CMS server run the following command from the testpages
project root folder:
```
python <CMS_PATH>/runserver.py
```

Test pages should now be accessible at http://localhost:5000.

For more information and usage instructions see [CMS documentation](https://gitlab.com/eyeo/websites/cms/-/blob/master/README.md).
