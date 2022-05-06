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

FROM node:16

RUN export npm_config_unsafe_perm=true
RUN apt-get update
RUN apt-get install -y wget git unzip

## Build extension with current branch ##
# Clone ABPUI
RUN git clone -b 3.13 https://gitlab.com/eyeo/adblockplus/abpui/adblockplusui.git
# Update dependencies 
RUN cd adblockplusui && npm run submodules:update && git submodule status && npm install
# Create extension builds

# Clone Core files for specific branch:
ARG ABPCORE_TAG=""
RUN if -z "$ABPCORE_TAG"; then cd adblockplusui/vendor/webext-sdk/node_modules && rm -rf adblockpluscore \
 && git clone -b $ABPCORE_TAG https://gitlab.com/eyeo/adblockplus/abc/adblockpluscore.git ; fi
RUN cd adblockplusui/vendor/webext-sdk/node_modules/adblockpluscore && npm install
RUN cd adblockplusui/adblockpluschrome \
 && npx gulp build -t chrome -c development
RUN mv adblockplusui/adblockpluschrome/adblockpluschrome-*.zip adblockplusui/adblockpluschrome/adblockpluschrome.zip 