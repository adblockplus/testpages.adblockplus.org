FROM node:10

# Install flake8
RUN apt-get update
RUN apt-get install -y python python-pip
RUN pip install flake8

# Install flake8-eyeo
RUN pip install git+https://gitlab.com/eyeo/auxiliary/eyeo-coding-style#egg=flake8-eyeo&subdirectory=flake8-eyeo

# Install node packages
COPY package.json testpages.adblockplus.org/package.json
RUN cd testpages.adblockplus.org \
  && npm install

COPY . testpages.adblockplus.org

ENTRYPOINT ./testpages.adblockplus.org/test/lint.sh
