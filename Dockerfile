FROM node:16
COPY . /app
WORKDIR /app
RUN npm install --only=production

CMD ["node", "src/server.js"]
