FROM browserless/base:latest

# Application parameters and variables
ENV DEBIAN_FRONTEND=noninteractive
ENV APP_DIR=/home/node/app
ENV LANG="C.UTF-8"
ENV CC=clang
ENV CXX=clang++

# install pnpm
RUN npm install -g pnpm

WORKDIR $APP_DIR

COPY package.json .npmrc ./
RUN pnpm install --prod

COPY . .

USER blessuser

EXPOSE 3000

CMD ["node", "src/server.js"]
