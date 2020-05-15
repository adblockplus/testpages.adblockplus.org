ARG IMAGE
FROM ${IMAGE}

COPY . testpages.adblockplus.org

# Generate test pages files
RUN mkdir -p /var/www/local.testpages.adblockplus.org
RUN sed -i '/siteurl/c\siteurl = https:\/\/local.testpages.adblockplus.org' testpages.adblockplus.org/settings.ini
RUN PYTHONPATH=cms python -m cms.bin.generate_static_pages testpages.adblockplus.org /var/www/local.testpages.adblockplus.org

ENV BROWSER="Firefox \(latest\)"
ENV TESTS_SUBSET=""

ENTRYPOINT ./testpages.adblockplus.org/test/entrypoint.sh
