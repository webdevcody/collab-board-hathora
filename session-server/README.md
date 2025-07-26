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

Set the `BACKEND_URL` environment variable to specify the backend server URL for board state persistence:

```bash
# default
BACKEND_URL=http://localhost:3000
```

### Board State Persistence

The session server automatically persists board state (shapes) to the backend service with the following behavior:

- **Debounced Persistence**: Changes are persisted after a 2-second debounce period
- **Shape-Only Persistence**: Only shapes are persisted, cursor positions are not saved
- **Automatic Loading**: When a room is created, existing shapes are loaded from the backend
- **Cleanup**: When rooms become empty, final state is persisted before cleanup

The persistence happens automatically when:

- A new shape is created
- An existing shape is updated
- A shape is deleted

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

The server handles various message types for collaborative drawing:

**Cursor Movement:**

```json
{
  "type": "cursor_move",
  "x": 100,
  "y": 200
}
```

**Shape Creation:**

```json
{
  "type": "shape_create",
  "shapeType": "rectangle",
  "x": 100,
  "y": 200,
  "width": 150,
  "height": 100,
  "text": "Hello World",
  "fill": "#3b82f6",
  "stroke": "#1d4ed8"
}
```

**Shape Update:**

```json
{
  "type": "shape_update",
  "shapeId": "abc123",
  "x": 150,
  "y": 250,
  "width": 200,
  "height": 150,
  "text": "Updated text",
  "fill": "#ef4444",
  "stroke": "#dc2626",
  "rotation": 45
}
```

**Shape Deletion:**

```json
{
  "type": "shape_delete",
  "shapeId": "abc123"
}
```

### Server->Client Messages

The server sends room snapshots as JSON containing all current state:

```json
{
  "connectedUsers": ["user123", "user456"],
  "cursors": [
    {
      "userId": "user123",
      "x": 100,
      "y": 200,
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ],
  "shapes": [
    {
      "id": "abc123",
      "type": "rectangle",
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 100,
      "userId": "user123",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "text": "Hello World",
      "fill": "#3b82f6",
      "stroke": "#1d4ed8",
      "rotation": 0
    }
  ]
}
```
