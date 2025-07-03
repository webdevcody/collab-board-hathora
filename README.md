# Scalable Chat

An open-source chat application to demonstrate the stateful routing pattern for building scalable real-time applications. [Live demo](https://d5huis9tac6kp.cloudfront.net/)

<img width="350" alt="Screenshot1" src="https://github.com/user-attachments/assets/940a7116-a11e-4502-9da8-9b38fbd5dc85" />

<img width="350" alt="Screenshot2" src="https://github.com/user-attachments/assets/2235840d-64d9-4246-835e-dcb305efd127" />

## Features

**Real-time chat rooms**

Clients create new chat rooms or join existing ones by ID. Messages are exchanged in real-time over WebSocket connections. Simple username based authentication.

**Horizontal scalability**

Clients belonging to the same room always connect to the same WebSocket server instance. Additional WebSocket servers created as necessary. No message broker or communication between WebSocket servers required.

**Room concurrency**

Each WebSocket server can handle multiple room sessions concurrently.

**Persistence (not included)**

For the purposes of this sample application, messages are not persisted beyond the lifetime of the WebSocket server. In order to support persistence, the following functionality would need to be added:

- The `HathoraScheduler` would need to call `resumeRoom` instead of `getConnectionInfo`
- `getOrLoadRoom` would need to hydrate room data from storage (e.g. S3, Redis, etc)
- The server would need to save room data to storage (syncing periodically, on process exit, etc)

## Architecture

### Overview

This project consists of three main components:

- [**Client**](client) - React single-page application
- [**Backend Server**](backend-server) - Express.js API server for authentication and room management
  - [Scheduler](backend-server/src/scheduler.ts) - Module inside the Backend Server for interfacing with the Session Server. This project includes two Scheduler implementations:
    1. `LocalScheduler` for statically defined session server instances (e.g. for local development)
    2. `HathoraScheduler` for dynamically created session server instances running on [Hathora Cloud](https://hathora.dev/docs)
- [**Session Server**](session-server) - Node.js WebSocket server for real-time chat functionality

<img width="532" alt="Architecture" src="https://github.com/user-attachments/assets/bfd36a9f-44ea-4bec-95af-2bf7fe881d7a" />

### Deployment Topolgy

- [**Client**](client) - Collection of static files deployed on a CDN. This project [deploys to AWS S3 + Cloudfront](.github/workflows/client-deploy.yml)
- [**Backend Server**](backend-server) - Stateless Docker container with multiple replicas deployed behind a load balancer. This project [deploys to AWS ECS Fargate](.github/workflows/backend-server-deploy.yml)
- [**Session Server**](session-server) - Stateful Docker container with instances spawned on-demand and direct container ingress. This project [deploys to Hathora Cloud](.github/workflows/session-server-deploy.yml)

## Data Flow

### Create New Room

<img width="498" alt="Create flow" src="https://github.com/user-attachments/assets/0d972b84-75c8-4ade-b09b-8e0cef15259e" />

1. The client requests the backend server for a new chat room session
2. The backend server authorizes the request and invokes the scheduler module
3. The scheduler allocates a room to a session server instance (spwaning a new instance if necessary)
4. The scheduler responds with the allocated `roomId`
5. The backend server forwards the `roomId` to the client

The client then proceeds with the Join Existing Room flow using the `roomId`

### Join Existing Room

<img width="507" alt="Join flow" src="https://github.com/user-attachments/assets/af82182f-cec3-44a5-8e18-765011857c33" />

1. The client requests the backend server for the session server instance host corresponding to a `roomId`
2. The backend server queries the scheduler module and responds with the host (or 404 if not found)
3. The client establishes a bi-directional connection with the session server instance

## Developing

### Clone the repository

```bash
git clone https://github.com/hpx7/scalable-chat
cd scalable-chat
```

### Start services

Each service should run in a different terminal tab. See individual instructions for [client](client), [backend-server](backend-server), and [session-server](session-server).
