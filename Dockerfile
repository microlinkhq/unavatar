FROM browserless/base:latest

# Application parameters and variables
ENV DEBIAN_FRONTEND=noninteractive
ENV APP_DIR=/home/node/app
ENV LANG="C.UTF-8"
#ENV CC=clang
#ENV CXX=clang++
#ENV NODE_OPTIONS='--no-deprecation'

# install node22 (matches package.json "engines")
RUN . $NVM_DIR/nvm.sh && nvm_dir="${NVM_DIR:-~/.nvm}" && nvm unload && rm -rf "$nvm_dir"
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs

# install pnpm
# Pinned to pnpm 9 on purpose: pnpm >= 10.26 enables `blockExoticSubdeps` by
# default, which ABORTS the install because a transitive devDependency
# (@ksmithut/prettier-standard -> prettierx -> parse-srcset) resolves via git.
# This repo ships no lockfile (lockfile=false in .npmrc), so pnpm resolves the
# full graph (dev deps included) even with --prod. pnpm 9 predates that check.
RUN npm install -g pnpm@9

WORKDIR $APP_DIR

COPY package.json .npmrc .puppeteerrc.js ./
RUN pnpm install --prod

COPY . .

USER blessuser

EXPOSE 3000

CMD ["node", "src/server.js"]
