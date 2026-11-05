#! /bin/bash

set -eu

cd testpages.adblockplus.org
yamllint -v && yamllint -c test/.yamllint.config.yml .gitlab-ci.yml
npm run lint