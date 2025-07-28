FROM node:22-alpine as build

WORKDIR /app

COPY . ..

# Run npm ci from workspace root where package-lock.json exists
RUN npm ci --workspace=session-server
RUN npm run build --workspace=session-server

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=build /app/session-server/package*.json .

RUN npm ci --only=production

COPY --from=build /app/session-server/dist dist

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
