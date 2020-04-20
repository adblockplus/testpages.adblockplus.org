FROM node:10

# Install packages
COPY package.json testpages.adblockplus.org/package.json
RUN cd testpages.adblockplus.org \
  && npm install

COPY . testpages.adblockplus.org

ENTRYPOINT ./testpages.adblockplus.org/test/lint.sh
