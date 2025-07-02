# Chat Demo - Backend Server

The backend server is a stateless Express.js application built with TypeScript that provides user authentication and room management.

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- Hathora Cloud account and credentials

### Installation

Install dependencies:

```bash
cd backend-server
npm install
```

### Running

Start the development server:

```bash
npm start
```

Upon starting, the server should emit a log line like `Listening on *:8080`

### Configuration

Set the `JWT_SECRET` to an arbitrary string. This secret will be used to sign user jwt tokens.

```bash
export JWT_SECRET="random-string"
```

Optionally set the `PORT` environment variable to override the port the backend server listens on (default `8080`):

```bash
export PORT=9090
```

#### Scheduler Configuration

The backend server can interface with session servers in two ways:

Option 1: Local Scheduler (static Session Server instances)

Set the local session server host(s):

```bash
# single server:
export SESSION_SERVER_HOST="localhost:8000"
# comma-separated for multiple servers:
export SESSION_SERVER_HOST="localhost:8000,localhost:8001,localhost:8002"
```

Option 2: Hathora Scheduler (dynamic Session Server instances)

Set the Hathora Cloud details. You can get these from the [Hathora Console](https://console.hathora.dev/):

```bash
export HATHORA_APP_ID="your-app-id"
export HATHORA_TOKEN="your-token"
```

## Production Deployment

Install the [Hathora CLI](https://hathora.dev/docs/hathora-cli):

```bash
curl -s https://raw.githubusercontent.com/hathora/ci/main/install.sh | sh
```

Deploy on Hathora:

```bash
hathora deploy \
  --file session-server \
  --container-port 8000 \
  --transport-type tls \
  --requested-cpu 0.5 \
  --requested-memory-mb 1024 \
  --rooms-per-process 5 \
  --idle-timeout-enabled \
  --app-id $HATHORA_APP_ID \
  --token $HATHORA_TOKEN
```

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

**`POST /api/rooms/:roomId`**

Get session server host for an existing room. Requires `Authorization: Bearer <jwt-token>` header.

Returns:

```json
{
  "host": "localhost:8000",
  "token": "session-jwt-token"
}
```

Returns `404` if room not found or expired
