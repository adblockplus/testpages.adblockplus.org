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

FROM registry.gitlab.com/eyeo/docker/get-browser-binary:node18-testpages

# nginx config
ENV DOMAIN=local.abptestpages.org
COPY test/etc /etc
RUN rm /etc/nginx/sites-enabled/default
RUN rm /etc/nginx/sites-available/default
RUN cd /etc/nginx && openssl req -x509 -newkey rsa:4096 \
  -keyout ${DOMAIN}_key.pem \
  -out ${DOMAIN}_cert.pem \
  -days 365 -nodes -subj '/CN=$DOMAIN'

# Build CMS
RUN git clone https://gitlab.com/eyeo/websites/cms.git
RUN git -C cms checkout fbd1527b9f98d99a8b62c6ad5e32ac7758c19a28
RUN pip3 install -r cms/requirements.txt

# Build tests
COPY package*.json testpages.adblockplus.org/
RUN cd testpages.adblockplus.org && npm install

COPY . testpages.adblockplus.org

# Generate test pages files
ENV SITE_URL=https://$DOMAIN:5001
RUN mkdir -p /var/www/$DOMAIN
RUN PYTHONPATH=cms python3 -m cms.bin.generate_static_pages testpages.adblockplus.org /var/www/$DOMAIN

# Unpack custom extension
ARG EXTENSION_FILE=""
RUN if [ "$EXTENSION_FILE" != "" ]; then unzip -q testpages.adblockplus.org/$EXTENSION_FILE -d testpages.adblockplus.org/testext; fi

ENV GREP="firefox latest"
ENV SKIP_EXTENSION_DOWNLOAD=""
ENV THROW_LAST_ERROR=""

ENTRYPOINT ./testpages.adblockplus.org/test/entrypoint.sh
