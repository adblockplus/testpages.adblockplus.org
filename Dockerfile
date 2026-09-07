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

# EXPERIMENT - do not merge as is. Inlines the proposed bookworm version of
# registry.gitlab.com/eyeo/docker/get-browser-binary:node22 to verify the
# Debian bullseye EOL fix before changing eyeo/docker.
FROM node:22.14.0-bookworm-slim

# General packages
RUN apt-get update && apt-get install -y git procps wget unzip bzip2 gnupg xz-utils

# xvfb (headful browser run)
RUN apt-get install -y libgtk-3-0 libxt6 xvfb libnss3 libxss1

# General browser dependencies
RUN apt-get install -y libasound2 libgbm1

# Edge dependencies
RUN apt-get install -y fonts-liberation libatomic1 xdg-utils libu2f-udev libvulkan1

# Install nginx 1.30.2
RUN apt-get update && apt-get install -y curl lsb-release \
  && curl -fsSL https://nginx.org/keys/nginx_signing.key | gpg --dearmor \
     > /usr/share/keyrings/nginx-archive-keyring.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
     https://nginx.org/packages/$(. /etc/os-release && echo "$ID") \
     $(lsb_release -sc) nginx" \
     > /etc/apt/sources.list.d/nginx.list \
  && apt-get update && apt-get install -y nginx=1.30.2-1~$(lsb_release -sc)

# CMS requires Python 3
RUN apt-get install -y python3 python3-distutils python3-pip

# nginx config
ENV DOMAIN=local.testpages.adblockplus.org
COPY test/etc /etc
RUN rm /etc/nginx/conf.d/default.conf \
  && echo 'include /etc/nginx/sites-enabled/*.conf;' \
     > /etc/nginx/conf.d/sites-enabled.conf
RUN cd /etc/nginx && openssl req -x509 -newkey rsa:4096 \
  -keyout ${DOMAIN}_key.pem \
  -out ${DOMAIN}_cert.pem \
  -days 365 -nodes -subj '/CN=$DOMAIN'

# Build CMS
RUN git clone https://gitlab.com/eyeo/websites/cms.git
RUN git -C cms checkout fbd1527b9f98d99a8b62c6ad5e32ac7758c19a28
RUN pip3 install --break-system-packages -r cms/requirements.txt

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
ENV TEST_PAGES_URL="$SITE_URL/en/"
ENV TEST_PAGES_INSECURE="true"
ENV START_LOCAL_SERVERS="true"

ENTRYPOINT ./testpages.adblockplus.org/test/entrypoint.sh
