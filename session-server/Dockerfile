FROM node:22-alpine as build

WORKDIR /app

COPY . ..

# Install dependencies and build from session-server directory
WORKDIR /app/session-server
RUN npm install
# Build from workspace root so TypeScript can find common modules
WORKDIR /app
RUN npm run build --workspace=@scalable-chat/session-server

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=build /app/session-server/package*.json .

RUN npm install --only=production

COPY --from=build /app/session-server/dist dist

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
