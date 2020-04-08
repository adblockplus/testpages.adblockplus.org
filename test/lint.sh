#! /bin/bash

cd testpages.adblockplus.org
# See all `.htmllintrc` config options at https://github.com/htmllint/htmllint/wiki/Options
htmllint --rc test/.htmllintrc **/*.+\(tmpl\|html\)
