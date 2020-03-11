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
ARG REVISION

# Build CMS
RUN git clone https://github.com/adblockplus/cms.git
RUN cd cms && pip install -r requirements.txt

# Build test env
RUN git clone https://gitlab.com/eyeo/adblockplus/adblockpluschrome.git
RUN git -C adblockpluschrome checkout $REVISION
RUN cd adblockpluschrome \
  && npm install \
  && npm_config_unsafe_perm=true python ensure_dependencies.py
