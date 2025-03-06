FROM browserless/base:latest

# Application parameters and variables
ENV DEBIAN_FRONTEND=noninteractive
ENV APP_DIR=/home/node/app
ENV LANG="C.UTF-8"
ENV CC=clang
ENV CXX=clang++
ENV NODE_OPTIONS='--no-deprecation'

# install node20
RUN . $NVM_DIR/nvm.sh && nvm_dir="${NVM_DIR:-~/.nvm}" && nvm unload && rm -rf "$nvm_dir"
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs

# install pnpm
RUN npm install -g pnpm

WORKDIR $APP_DIR

COPY package.json .npmrc .puppeteerrc.js ./
RUN pnpm install --prod

COPY . .

USER blessuser

EXPOSE 3000

CMD ["node", "src/server.js"]
