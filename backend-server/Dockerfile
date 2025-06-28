FROM node:22-alpine as build

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/package*.json .

RUN npm ci --only=production

COPY --from=build /app/dist dist

CMD ["node", "dist/server.js"]
