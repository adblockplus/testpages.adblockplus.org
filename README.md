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

Html code is checked with `htmllint-cli` npm package. To run the lint image:
```
docker build -t lintimage -f test/lint.Dockerfile .
docker run -it lintimage
```

### Page tests

The CI/CD pipeline uses a cached image that does not exist locally. In order to
create the image, run:
```
docker build -t cachedimage -f test/build.Dockerfile .
```

Now tests can be executed with:
```
docker build -t testpages --build-arg IMAGE=cachedimage .
docker run -it testpages
```

#### Revision

`next` is the default revision of `adblockpluschrome` used to build the
`cachedimage` image. Other revisions can be built using the `REVISION` argument:
```
docker build -t cachedimage --build-arg REVISION=master -f test/build.Dockerfile .
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

#### Screenshots

In order to access the screenshots for failing tests, run the following command:
```
docker cp $(docker ps -aqf ancestor=testpages | head -n 1):/adblockpluschrome/test/screenshots <destination>
```

Screenshots will be available in `<destination>` folder.

#### Tests subset

In order to run a subset of the tests, use the `TESTS_SUBSET` argument,
which supports regular expressions. Example:
```
docker run -e TESTS_SUBSET="(Blocking|popup)" -it testpages
```

## Local testpages execution

Test pages run through the CMS test server. That project needs to be cloned:
```
git clone https://github.com/adblockplus/cms.git
```

Once the CMS project has been copied, run the following command:
```
python <CMS_LOCATION>/runserver.py
```

Test pages should now be accessible at http://localhost:5000.

For more information and usage instructions see [CMS documentation](https://github.com/adblockplus/cms/blob/master/README.md#content-structure).
