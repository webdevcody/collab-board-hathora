FROM node:22-alpine as build

WORKDIR /app

COPY . .

RUN npm i
RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=build /app/package*.json .

RUN npm i --only=production

COPY --from=build /app/dist dist

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
