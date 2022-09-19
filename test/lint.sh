#! /bin/bash

set -eu

cd testpages.adblockplus.org
yamllint -v && yamllint -c test/.yamllint.config.yml .gitlab-ci.yml
echo "> flake8:" && flake8 --version && flake8
npm run linthtml
npm run stylelint
npm run eslint
