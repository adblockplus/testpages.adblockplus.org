FROM registry.gitlab.com/eyeo/docker/get-browser-binary:node22

# Install yamllint for CI configuration checks
RUN apt-get update && apt-get install -y yamllint

# Install node packages
COPY package*.json testpages.adblockplus.org/
RUN cd testpages.adblockplus.org && npm ci

COPY . testpages.adblockplus.org

# nosemgrep: dockerfile.security.missing-user-entrypoint.missing-user-entrypoint -- ephemeral CI lint image with no exposed services
ENTRYPOINT ./testpages.adblockplus.org/test/lint.sh
