FROM node:22-alpine as build

WORKDIR /app

COPY . ..

WORKDIR /app/session-server

RUN npm ci
RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=build /app/session-server/package*.json .

RUN npm ci --only=production

COPY --from=build /app/session-server/dist dist

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
