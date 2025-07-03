# Scalable Chat - Backend Server

The backend server is an Express.js application built with TypeScript that provides user authentication and room management.

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- [Hathora Cloud](https://hathora.dev/docs) account (optional)

### Installation

Install dependencies:

```bash
cd backend-server
npm install
```

### Configuration

Set the `JWT_SECRET` to an arbitrary string. This secret will be used to sign user jwt tokens.

```bash
JWT_SECRET="random-string"
```

Optionally set the `PORT` environment variable to override the port the backend server listens on (default `8080`):

```bash
PORT=9090
```

#### Scheduler Configuration

The backend server can interface with session servers in two ways:

Option 1 (default): `LocalScheduler` (static Session Server instances)

Set the local session server host(s):

```bash
# default:
SESSION_SERVER_HOST="localhost:8000"
# comma-separated for multiple servers:
SESSION_SERVER_HOST="localhost:8000,localhost:8001,localhost:8002"
# remote server:
SESSION_SERVER_HOST="app.example.com"
```

Option 2: `HathoraScheduler` (dynamic Session Server instances)

Set the Hathora Cloud details. You can get these from the [Hathora Console](https://console.hathora.dev/):

```bash
HATHORA_APP_ID="your-app-id" HATHORA_TOKEN="your-token"
```

### Running

Start the development server:

```bash
JWT_SECRET=secret npm start
```

Upon starting, the server should emit a log line like `Listening on *:8080`

## Production Deployment

Use Docker to build and push the image:

```bash
docker build -t $REGISTRY .
docker push $REGISTRY
```

The image can then be deployed to any container hosting service (Kubernetes, ECS, Fly.io, etc).

## HTTP API

### Authentication

**`POST /api/login`**

Authenticate with a username:

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
