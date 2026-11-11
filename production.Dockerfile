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

# Production image for Cloud Run: one Node process serves the generated pages,
# /sitekey-frame and the WebSocket echo endpoints on $PORT.

FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci

COPY . .
ARG SITE_URL
RUN test -n "$SITE_URL" && npm run build

FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    STATIC_DIR=/app/build

WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci --omit=dev && npm cache clean --force

COPY endpoints endpoints
COPY --from=build /app/build build

USER node
EXPOSE 8080
CMD ["node", "endpoints/start.js"]
