ARG BASE_IMAGE
FROM ${BASE_IMAGE}

COPY . testpages.adblockplus.org

ENTRYPOINT ./testpages.adblockplus.org/test/entrypoint.sh
