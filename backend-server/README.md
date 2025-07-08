# Scalable Chat - Backend Server

The backend server is an [Express.js](https://expressjs.com/) application built with TypeScript that provides user authentication and room management.

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- (optional) [Hathora Cloud](https://hathora.dev/docs) account

### Installation

Install dependencies:

```bash
cd backend-server
npm install
```

### Configuration

Set the `JWT_SECRET` to an arbitrary string. This secret will be used to sign user jwt tokens.

```bash
JWT_SECRET="secret-string"
```

Optionally set the `PORT` environment variable to override the port the backend server listens on:

```bash
# default
PORT=8080
```

#### Scheduler Configuration

The backend server can interface with session servers in two ways:

_Option 1 (default)_: `StaticScheduler` (static Session Server instances)

Set the local session server host(s) via the `SESSION_SERVER_HOST` environment variable:

```bash
# default:
SESSION_SERVER_HOST="localhost:8000"

# comma-separated for multiple servers:
SESSION_SERVER_HOST="localhost:8000,localhost:8001,localhost:8002"

# remote server:
SESSION_SERVER_HOST="app.example.com"
```

_Option 2_: `HathoraScheduler` (dynamic Session Server instances)

Set the Hathora Cloud environment variables. You can get these from the [Hathora Console](https://console.hathora.dev/):

```bash
HATHORA_APP_ID="your-app-id" HATHORA_TOKEN="your-token"
```

### Running

Start the development server ([tsx](https://tsx.is/)):

```bash
JWT_SECRET=secret-string npm start
```

Upon starting, the server should emit a log line like `Listening on *:8080`

## Production Deployment

Use Docker to build and push the image:

```bash
docker build -t $REGISTRY .
docker push $REGISTRY
```

The image can then be deployed to any container hosting service (Kubernetes, ECS, Fly.io, etc). [Reference Github Action](../.github/workflows/backend-server-deploy.yml)

> Remember to configure the appropriate environment variables on your service

## HTTP API

### Authentication

**`POST /api/login`**

Authenticate with a `userId`:

```json
{
  "userId": "string"
}
```

Returns a JWT token:

```json
{
  "token": "jwt-token"
}
```

### Room Management

**`POST /api/rooms`**

Create a new chat room. Requires `Authorization: Bearer <jwt-token>` header.

Returns:

```json
{
  "roomId": "unique-room-id"
}
```

**`GET /api/rooms/:roomId`**

Get session server host for an existing room. Requires `Authorization: Bearer <jwt-token>` header.

Returns:

```json
{
  "host": "localhost:8000",
  "token": "session-jwt-token"
}
```

Returns `404` if room not found or expired.
