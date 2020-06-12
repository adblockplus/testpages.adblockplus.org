#! /bin/bash

# Browser config
if [[ "$BROWSER" == *"Chromium"* ]]; then
  XVFB_CMD="xvfb-run -a"
fi

tests="$BROWSER.*Test pages.*$TESTS_SUBSET"

# Run sitescripts
/etc/init.d/spawn-fcgi restart

# Run test pages server
echo -e "\n127.0.0.1 local.testpages.adblockplus.org" >> /etc/hosts
nginx

# Run tests
cd adblockpluschrome
export TEST_PAGES_URL="https://local.testpages.adblockplus.org/en/"
export TEST_PAGES_INSECURE="true"
echo "INFO: Tests will execute based on the following revision:"
git status 2>&1 | head -n 1
git log -5 --oneline
$XVFB_CMD npm run test-only -- -g "$tests"