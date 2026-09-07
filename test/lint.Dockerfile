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

# CMS requires Python 3
RUN apt-get update && apt-get install -y python3 python3-distutils python3-pip

# Install flake8 with flake8-eyeo
RUN pip3 install --break-system-packages flake8
RUN pip3 install --break-system-packages git+https://gitlab.com/eyeo/auxiliary/eyeo-coding-style#egg=flake8-eyeo&subdirectory=flake8-eyeo

# Install yamllint
RUN pip3 install --break-system-packages yamllint

# Install node packages
COPY package*.json testpages.adblockplus.org/
RUN cd testpages.adblockplus.org && npm install

COPY . testpages.adblockplus.org

ENTRYPOINT ./testpages.adblockplus.org/test/lint.sh
