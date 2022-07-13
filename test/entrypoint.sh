#! /bin/bash

# Browser config
if [[ "$BROWSER" == *"chromium"* ]]; then
  XVFB_CMD="xvfb-run -a"
fi

if [[ "$TESTS_EXCLUDE" != "" ]]; then
  tests="^Browser: $BROWSER((?!$TESTS_EXCLUDE).)*\$"
else
  tests="$BROWSER.*$TESTS_SUBSET"
fi

# Run sitescripts
/etc/init.d/spawn-fcgi restart

# Run test pages server
echo -e "\n127.0.0.1 $DOMAIN" >> /etc/hosts
nginx

# Download extension
cd testpages.adblockplus.org

if [[ "$SKIP_EXTENSION_DOWNLOAD" != "true" ]]; then
  node ./test/extension-tests/extension-download.js
else
  echo "INFO: A custom extension will be used to run the tests"
fi

# Run tests
export TEST_PAGES_URL="$SITE_URL/en/"
export TEST_PAGES_INSECURE="true"
$XVFB_CMD npm test -- -g "$tests"
