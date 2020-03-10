#! /bin/bash

# Browser config
if [[ "$BROWSER" == "" ]]; then
  BROWSER="Firefox"
elif [[ "$BROWSER" == "Chromium" ]]; then
  XVFB="xvfb-run -a"
fi

# Run CMS
cd testpages.adblockplus.org
python ../cms/runserver.py </dev/null &>/dev/null &
cd ..

# Run tests
cd adblockpluschrome
export TEST_PAGES_URL="http://localhost:5000"
# subscribe test is excluded until adblockpluschrome#155 is fixed
# popup test should be re-enabled when adblockpluschrome/issues/129 is fixed
$XVFB npm run test-only -- -g "^$BROWSER \(latest\)((?!qunit|subscribe|popup).)*\$"
