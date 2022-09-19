FROM node:16-bullseye-slim

RUN apt-get update
RUN apt-get install -y wget git

# Install flake8
RUN apt-get install -y python3 python3-distutils
RUN wget https://bootstrap.pypa.io/pip/get-pip.py
RUN python3 get-pip.py
RUN pip3 install flake8

# Install flake8-eyeo
RUN pip3 install git+https://gitlab.com/eyeo/auxiliary/eyeo-coding-style#egg=flake8-eyeo&subdirectory=flake8-eyeo

# Install yamllint
RUN pip3 install yamllint

# Install node packages
COPY package*.json testpages.adblockplus.org/
RUN cd testpages.adblockplus.org && npm install

COPY . testpages.adblockplus.org

ENTRYPOINT ./testpages.adblockplus.org/test/lint.sh
