#! /bin/bash

cd testpages.adblockplus.org
flake8 && npm run htmllint && npm run stylelint && npm run eslint
