FROM browserless/base:latest

# Application parameters and variables
ENV DEBIAN_FRONTEND=noninteractive
ENV APP_DIR=/home/node/app
ENV LANG="C.UTF-8"
ENV CC=clang
ENV CXX=clang++
ENV PUPPETEER_SKIP_CHROME_HEADLESS_SHELL_DOWNLOAD=true

# install pnpm
RUN npm install -g pnpm

WORKDIR $APP_DIR

COPY package.json .npmrc .puppeteerrc.js ./
RUN pnpm install --prod

COPY . .

USER blessuser

EXPOSE 3000

CMD ["node", "src/server.js"]
