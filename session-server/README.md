# Chat Demo - Session Server

The session server is a stateful Node.js WebSocket server built with TypeScript that provides real-time chat functionality.

## Local Development

### Prerequisites

- Node.js (v18 or higher)

### Installation

**Install dependencies**

```bash
cd session-server
npm install
```

### Running

Start the development server:

```bash
npm start
```

Upon starting, the server should emit a log line like `Listening on *:8000`

### Configuration

Optionally set the `PORT` environment variable to override the port the session server listens on (default `8000`):

```bash
PORT=7000 npm start
```

## Production Deployment

Use Docker to build and push the image:

```bash
docker build -t $REGISTRY .
docker push $REGISTRY
```

The image can then be deployed to any container hosting service (Kubernetes, ECS, Fly.io, etc).

## WebSocket Protocol

### Connection

The session JWT token (obtained from the Backend Server) is a required query parameter:

```
ws://localhost:8000?token=<jwt-token>
```

The JWT payload contains the userId and roomId, and is signed with the session server instance host.

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
