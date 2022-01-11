#! /bin/bash

# Browser config
if [[ "$BROWSER" == *"Chromium"* ]]; then
  XVFB_CMD="xvfb-run -a"
fi

if [[ "$TESTS_EXCLUDE" != "" ]]; then
  tests="^$BROWSER((?!$TESTS_EXCLUDE).)*\$"
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
fi

# Run tests
export TEST_PAGES_URL="$SITE_URL/en/"
export TEST_PAGES_INSECURE="true"
$XVFB_CMD npm test -- -g "$tests"
