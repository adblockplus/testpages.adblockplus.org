FROM registry.gitlab.com/eyeo/docker/get-browser-binary:node18-testpages

# Install flake8 with flake8-eyeo
RUN pip3 install flake8
RUN pip3 install git+https://gitlab.com/eyeo/auxiliary/eyeo-coding-style#egg=flake8-eyeo&subdirectory=flake8-eyeo

# Install yamllint
RUN pip3 install yamllint

# Install node packages
COPY package*.json testpages.adblockplus.org/
RUN cd testpages.adblockplus.org && npm install

COPY . testpages.adblockplus.org

ENTRYPOINT ./testpages.adblockplus.org/test/lint.sh
