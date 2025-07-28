FROM node:22-alpine as build

WORKDIR /app

COPY .. .

WORKDIR /app
RUN npm install
RUN npm run build:session

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=build /app/session-server/package*.json .

RUN npm install --only=production

COPY --from=build /app/session-server/dist dist

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
