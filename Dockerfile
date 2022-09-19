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

FROM node:16-bullseye-slim

RUN apt-get update
RUN apt-get install -y wget git unzip nginx

# Non-headless Chromium requires xvfb-run
RUN apt-get install -y libgtk-3-0 libxt6 xvfb libnss3 libxss1 libgconf-2-4 libasound2 libgbm1

# CMS requires Python 3 with Jinja2
RUN apt-get install -y python3 python3-distutils
RUN wget https://bootstrap.pypa.io/pip/get-pip.py
RUN python3 get-pip.py
RUN pip3 install Jinja2

# Sitescripts requires spawn-fcgi and Python 2.7 with flup, m2crypto and Jinja2
RUN apt-get install -y spawn-fcgi python
RUN wget https://bootstrap.pypa.io/pip/2.7/get-pip.py -O get-pip2.py
RUN python2 get-pip2.py
RUN pip2 install Jinja2
# https://stackoverflow.com/questions/8589008/python-2-7-import-flup-error
RUN pip2 install flup==1.0.3.dev-20110111
# https://gitlab.com/m2crypto/m2crypto/-/blob/master/INSTALL.rst
RUN apt-get install -y build-essential python-dev libssl-dev swig
RUN pip2 install M2Crypto

# nginx config
ENV DOMAIN=local.testpages.adblockplus.org
COPY test/etc /etc
RUN rm /etc/nginx/sites-enabled/default
RUN rm /etc/nginx/sites-available/default
RUN cd /etc/nginx && openssl req -x509 -newkey rsa:4096 \
  -keyout ${DOMAIN}_key.pem \
  -out ${DOMAIN}_cert.pem \
  -days 365 -nodes -subj '/CN=$DOMAIN'

# spawn-fcgi config
RUN touch /var/run/500-multiplexer_spawn-fcgi.pid

# Build sitescripts
RUN git clone https://gitlab.com/eyeo/devops/legacy/sitescripts.git

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

ENV GREP=""
ENV SKIP_EXTENSION_DOWNLOAD=""
# BROWSER, TESTS_SUBSET and TESTS_EXCLUDE are deprecated
# https://gitlab.com/eyeo/adblockplus/abc/testpages.adblockplus.org/-/issues/124
ENV BROWSER="firefox latest"
ENV TESTS_SUBSET=""
ENV TESTS_EXCLUDE=""

ENTRYPOINT ./testpages.adblockplus.org/test/entrypoint.sh
