FROM node:10

RUN npm install -g htmllint-cli
COPY . testpages.adblockplus.org

ENTRYPOINT ./testpages.adblockplus.org/test/lint.sh
