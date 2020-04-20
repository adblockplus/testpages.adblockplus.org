#! /bin/bash

cd testpages.adblockplus.org
# See all `.htmllintrc` config options at https://github.com/htmllint/htmllint/wiki/Options
npm run htmllint
npm run eslint
