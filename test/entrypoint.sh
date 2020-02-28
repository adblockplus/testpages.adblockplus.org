#! /bin/bash

# Run CMS
cd testpages.adblockplus.org
python ../cms/runserver.py </dev/null &>/dev/null &
cd ..

# Run tests
cd adblockpluschrome
export TEST_PAGES_URL="http://localhost:5000"
# subscribe test is excluded until adblockpluschrome#155 is fixed
# popup test should be re-enabled when adblockpluschrome/issues/129 is fixed
npm run test-only -- -g '^Firefox \(latest\)((?!qunit|subscribe|popup).)*$'
