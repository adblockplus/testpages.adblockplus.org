FROM node:12

# Install flake8
RUN apt-get update
RUN apt-get install -y python
RUN wget https://bootstrap.pypa.io/pip/2.7/get-pip.py
RUN python get-pip.py
RUN pip install flake8

# Install flake8-eyeo
RUN pip install git+https://gitlab.com/eyeo/auxiliary/eyeo-coding-style#egg=flake8-eyeo&subdirectory=flake8-eyeo

# Install yamllint
RUN pip install yamllint

# Install node packages
COPY package.json testpages.adblockplus.org/package.json
RUN cd testpages.adblockplus.org \
  && npm install

COPY . testpages.adblockplus.org

ENTRYPOINT ./testpages.adblockplus.org/test/lint.sh
