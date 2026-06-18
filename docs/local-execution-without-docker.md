## Local execution without Docker

Test pages can run locally through the CMS test server. That project needs to be cloned:

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
python3 <CMS_PATH>/runserver.py --port 5001
```

Test pages should now be accessible at http://localhost:5001. For more
information and usage instructions see [CMS documentation](https://gitlab.com/eyeo/websites/cms/-/blob/master/README.md).

Additionaly, the endpoints server needs to run as well, and should be accessible
at http://localhost:4000:

```shell
npm run start-endpoints
```

Testpages filters are set dynamically (except for Wildcard Domain support which are hardcoded). You can start server
with testpages filters pointing to specific domain:

```shell
SITE_URL=http://local.abptestpages.org python3 ../cms/runserver.py --port 5001
```

If you wish to test Domain Wildcard scenario locally, you need to
start browser from command line and map ports to  `local.abptestpages.org` (filters are already
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

Besides having both CMS and endpoint servers running, the test runner expects an
unpacked ABP extension to be located in the `./testext` folder. That can be
achieved by downloading the latest ABP release:

```shell
MANIFEST_VERSION={2|3} node ./test/extension-tests/extension-download.js
```

Note: It is also possible to manually extract a different ABP version into the
`./testext` folder.

After that, tests are ready to run. Please notice the `TEST_PAGES_URL`
environment variable needs to point to the local CMS server, if you wish to test
on abptestpages.org then don't provide that variable.

Additionally, `MANIFEST_VERSION` needs to be set, matching the manifest version
of the extensions that was unpacked into the `./testext` folder.

Example:

```shell
TEST_PAGES_URL=http://localhost:5001 MANIFEST_VERSION={2|3} npm test -- -g "chrome latest"
```

If testpage is excluded from execution in:
`/test/extension-tests/pages/utils.js`and you want to unskip it, you
can define environment variable to force unskip.

```shell
TESTS_TO_INCLUDE=filters/wildcard-domain MANIFEST_VERSION={2|3} npm test -- -g "chrome latest"
```

Notes:

- The `subscribes to a link` test case is expected to fail on the local run,
because it requires an `https` server which `runserver.py` does not provide.
- The `Sitekey` and `WebSocket` test cases are also expected to fail locally,
because they require a request redirection to http://localhost:4000 and
http://localhost:4001 which `runserver.py` does not provide.
