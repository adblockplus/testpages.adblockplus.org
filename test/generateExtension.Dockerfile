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

FROM node:12-buster-slim

RUN apt-get update
RUN apt-get install -y wget git unzip

## Build extension with current branch ##
# Clone abpui repo
RUN git clone -b 3.12 --recurse-submodules https://gitlab.com/eyeo/adblockplus/abpui/adblockplusui.git
RUN cd adblockplusui && npm install
RUN cd adblockplusui/adblockpluschrome && npm install

# Clone Core files for specific branch:
ARG CORE_TAG=""
RUN cd adblockplusui/adblockpluschrome/ && rm -rf adblockpluscore && git clone -b $CORE_TAG https://gitlab.com/eyeo/adblockplus/abc/adblockpluscore.git
RUN cd adblockplusui/adblockpluschrome/adblockpluscore && npm install
RUN cd adblockplusui/adblockpluschrome && npm install \
 && npx gulp build -t chrome -c development
RUN mv adblockplusui/adblockpluschrome/adblockpluschrome-*.zip adblockplusui/adblockpluschrome/adblockpluschrome.zip 
