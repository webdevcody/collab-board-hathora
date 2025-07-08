# Scalable Chat - Session Server

The session server is a Node.js WebSocket server built with TypeScript that provides real-time chat functionality.

## Local Development

### Prerequisites

- Node.js (v18 or higher)

### Installation

**Install dependencies**

```bash
cd session-server
npm install
```

### Configuration

Set the `JWT_SECRET` to match the value used in the backend server. This secret will be used to verify connection jwt tokens.

```bash
JWT_SECRET="secret-string"
```

Optionally set the `PORT` environment variable to override the port the session server listens on:

```bash
# default
PORT=8000
```

### Running

Start the development server ([tsx](https://tsx.is/)):

```bash
JWT_SECRET=secret-string npm start
```

Upon starting, the server should emit a log line like `Listening on *:8000`

## Production Deployment

Get your Hathora App ID and token from the [Hathora Console](https://console.hathora.dev/).

Install the [Hathora CLI](https://hathora.dev/docs/hathora-cli):

```bash
curl -s https://raw.githubusercontent.com/hathora/ci/main/install.sh | sh
```

Deploy on Hathora:

```bash
hathora deploy \
  --file . \
  --container-port 8000 \
  --transport-type tls \
  --requested-cpu 0.5 \
  --requested-memory-mb 1024 \
  --rooms-per-process 10 \
  --idle-timeout-enabled \
  --app-id $HATHORA_APP_ID \
  --env JWT_SECRET=$JWT_SECRET \
  --token $HATHORA_TOKEN
```

[Reference Github Action](../.github/workflows/session-server-deploy.yml)

You can tweak the cpu/memory parameters to give your container additional resources. `rooms-per-process` controls how many rooms can get allocated to a single session server instance.

## WebSocket Protocol

### Connection

The session JWT token (obtained from the Backend Server) is a required query parameter:

```
ws://localhost:8000?token=<jwt-token>
```

The JWT payload contains the `userId` and `roomId`, and is signed with the `JWT_SECRET`.

### Client->Server Messages

Chat messages are plain text strings:

```
Hello, world!
```

### Server->Client Messages

The server sends room snapshots as JSON:

```json
{
  "messages": [
    {
      "userId": "user123",
      "msg": "Hello!",
      "ts": "2024-01-01T12:00:00.000Z"
    }
  ],
  "connectedUsers": ["user123", "user456"]
}
```
