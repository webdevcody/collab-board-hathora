FROM node:22-alpine as build

WORKDIR /app

COPY . .

RUN npm i --legacy-peer-deps

CMD ["npm", "run", "start"]
