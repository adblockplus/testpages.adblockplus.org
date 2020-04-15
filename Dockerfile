ARG IMAGE
FROM ${IMAGE}

COPY . testpages.adblockplus.org
ENV BROWSER="Firefox \(latest\)"
ENV TESTS_SUBSET=""

ENTRYPOINT ./testpages.adblockplus.org/test/entrypoint.sh
