FROM node:lts

COPY package.json .npmrc ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
