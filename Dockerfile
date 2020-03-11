ARG IMAGE
FROM ${IMAGE}

COPY . testpages.adblockplus.org
ENV BROWSER="Firefox \(latest\)"

ENTRYPOINT ./testpages.adblockplus.org/test/entrypoint.sh
