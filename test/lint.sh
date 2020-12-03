#! /bin/bash

set -eu

cd testpages.adblockplus.org
flake8 --verbose
npm run htmllint
npm run stylelint
npm run eslint
