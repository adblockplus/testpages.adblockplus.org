#! /bin/bash

start_servers () {
  # test pages server
  echo -e "\n127.0.0.1 $DOMAIN" >> /etc/hosts
  nginx
  # endpoints server
  npm run start-endpoints &
}

# Browser config
if [[ "$GREP" == *"chromium"* || "$GREP" == *"edge"* ]]; then
  XVFB_CMD="xvfb-run -a"
fi

# Manifest config
if [[ "$GREP" == *"chromium"* ]]; then
  export MANIFEST_VERSION="3"
else
  export MANIFEST_VERSION="2"
fi

cd testpages.adblockplus.org

# Download extension
if [[ "$SKIP_EXTENSION_DOWNLOAD" != "true" ]]; then
  node ./test/extension-tests/extension-download.js
else
  echo "INFO: A custom extension will be used to run the tests"
fi

# Run tests
start_servers
export TEST_PAGES_URL="$SITE_URL/en/"
export TEST_PAGES_INSECURE="true"
$XVFB_CMD npm test -- -g "$GREP"
