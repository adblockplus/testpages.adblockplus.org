# Copyright (c) 2019-present eyeo GmbH
#
# This module is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

FROM registry.gitlab.com/eyeo/docker/adblockplus-ci:node10

# Running sitescripts requires spawn-fcgi, python-flup and python-m2crypto
RUN apt-get install -y spawn-fcgi python-flup python-m2crypto nginx

# nginx config
COPY test/etc /etc
RUN rm /etc/nginx/sites-enabled/default
RUN rm /etc/nginx/sites-available/default
RUN cd /etc/nginx && openssl req -x509 -newkey rsa:4096 \
  -keyout local.testpages.adblockplus.org_key.pem \
  -out local.testpages.adblockplus.org_cert.pem \
  -days 365 -nodes -subj '/CN=local.testpages.adblockplus.org'

# spawn-fcgi config
RUN touch /var/run/500-multiplexer_spawn-fcgi.pid

# Build sitescripts
RUN git clone https://gitlab.com/eyeo/devops/legacy/sitescripts.git

# Build CMS
RUN git clone https://github.com/adblockplus/cms.git
RUN cd cms && pip install -r requirements.txt

# Build adblockpluschrome test env
RUN git clone https://gitlab.com/eyeo/adblockplus/adblockpluschrome.git
ARG REVISION=next
RUN cd adblockpluschrome \
  && git fetch \
  && git checkout $REVISION \
  && npm install \
  && npm_config_unsafe_perm=true python ensure_dependencies.py

COPY . testpages.adblockplus.org

# Generate test pages files
RUN mkdir -p /var/www/local.testpages.adblockplus.org
RUN sed -i '/siteurl/c\siteurl = https:\/\/local.testpages.adblockplus.org' testpages.adblockplus.org/settings.ini
RUN PYTHONPATH=cms python -m cms.bin.generate_static_pages testpages.adblockplus.org /var/www/local.testpages.adblockplus.org

ENV BROWSER="Firefox \(latest\)"
ENV TESTS_SUBSET=""

ENTRYPOINT ./testpages.adblockplus.org/test/entrypoint.sh
