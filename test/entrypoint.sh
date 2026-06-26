#! /bin/bash

start_local_servers () {
  # test pages server
  echo -e "\n127.0.0.1 $DOMAIN" >> /etc/hosts
  nginx
  # endpoints server
  npm run start-endpoints &
}

# Browser config
if [[ "$GREP" == *"chromium"* || "$GREP" == *"chrome"* || "$GREP" == *"edge"* ]]; then
  XVFB_CMD="xvfb-run -a"
fi

# Manifest config
if [[ "$GREP" == *"chrome"* && "$GREP" != *"chromium"* ]]; then
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
if [[ "$START_LOCAL_SERVERS" == "true" ]]; then
  start_local_servers
fi
$XVFB_CMD npm test -- -g "$GREP"
