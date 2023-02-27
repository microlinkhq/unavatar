FROM browserless/base:latest

# Application parameters and variables
ENV DEBIAN_FRONTEND=noninteractive
ENV APP_DIR=/home/node/app
ENV LANG="C.UTF-8"
ENV CC=clang
ENV CXX=clang++

# install pnpm
RUN npm install -g pnpm

RUN userdel blessuser && \
  groupadd --gid 1000 node && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

WORKDIR $APP_DIR

COPY package.json .npmrc ./
RUN pnpm install --prod

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
