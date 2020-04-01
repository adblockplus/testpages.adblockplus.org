#! /bin/bash

# Browser config
if [[ "$BROWSER" == *"Chromium"* ]]; then
  XVFB_CMD="xvfb-run -a"
fi

# subscribe test is excluded until adblockpluschrome#155 is fixed
excluded="qunit|subscribe"

# Run CMS
cd testpages.adblockplus.org
python ../cms/runserver.py </dev/null &>/dev/null &
cd ..

# Run tests
cd adblockpluschrome
export TEST_PAGES_URL="http://localhost:5000"
echo "INFO: Tests will execute based on the following revision:"
git status 2>&1 | head -n 1
git log -5 --oneline
$XVFB_CMD npm run test-only -- -g "^$BROWSER((?!$excluded).)*\$"
