# Scalable Chat

An open-source chat application to demonstrate the stateful routing pattern for building scalable real-time applications. [Live demo](https://d5huis9tac6kp.cloudfront.net/)

<img width="350" alt="Screenshot1" src="https://github.com/user-attachments/assets/940a7116-a11e-4502-9da8-9b38fbd5dc85" />

<img width="350" alt="Screenshot2" src="https://github.com/user-attachments/assets/2235840d-64d9-4246-835e-dcb305efd127" />

This project means to serve as a helpful base or reference for anyone making a collaborative webapp, multiplayer game, stateful AI agent, or other session-based real-time application.

## Features

**Real-time chat rooms**

Clients create new chat rooms or join existing ones by ID. Messages are exchanged in real-time over WebSocket connections. Simple username based authentication.

**Horizontal scalability**

Clients belonging to the same room always connect to the same WebSocket server instance. Additional WebSocket servers created as necessary. No message broker or communication between WebSocket servers required.

**Room concurrency**

Each WebSocket server can handle multiple room sessions concurrently. Default limits are set to 100 users per room and 10 rooms per server instance, with unlimited server instances.

**Persistence (not included)**

For the purposes of this sample application, messages are not persisted beyond the lifetime of the WebSocket server. In order to support persistence, the session server would need to save and hydrate room data from storage (e.g. S3, Redis, etc).

## Architecture

### Overview

<img width="532" alt="Architecture" src="https://github.com/user-attachments/assets/bfd36a9f-44ea-4bec-95af-2bf7fe881d7a" />

This project consists of three main components:

- [**Client**](client) - React single-page application
- [**Backend Server**](backend-server) - Express.js API server for authentication and room management
  - [Scheduler](backend-server/src/scheduler.ts) - Module inside the Backend Server for interfacing with the Session Server. This project includes two Scheduler implementations:
    1. `StaticScheduler` for statically defined session server instances (e.g. for local development)
    2. `HathoraScheduler` for dynamically created session server instances running on [Hathora Cloud](https://hathora.dev/docs)
- [**Session Server**](session-server) - Node.js WebSocket server for real-time chat functionality

### Deployment Topolgy

<img width="532" alt="Deployment" src="https://github.com/user-attachments/assets/2394ef48-1a1d-4702-8aa9-a4cb8a7c33a3" />

- [**Client**](client) - Collection of static files deployed behind a CDN. This project [deploys to AWS S3 + CloudFront](.github/workflows/client-deploy.yml)
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

The client then proceeds with the Join Existing Room flow using the obtained `roomId`.

### Join Existing Room

<img width="505" alt="Join flow" src="https://github.com/user-attachments/assets/2edfeacd-8342-40a6-9e92-6f48123c0c93" />

1. The client requests the backend server for the session server instance host corresponding to a `roomId`
2. The backend server queries the scheduler module and responds with the host (or 404 if not found)
3. The client establishes a bi-directional connection with the session server instance

## Scheduler

The most novel part of this project is the [Scheduler module](backend-server/src/scheduler.ts). The `Scheduler` is responsible for allocating rooms to session server instances, and has a simple interface:

```ts
interface Scheduler {
  // assigns a new room to a session server instance, and returns its roomId
  createRoom(): Promise<string>;
  // returns the session server host corresponding to a given roomId
  getRoomHost(roomId: string): Promise<string | null>;
}
```

This project comes with two implementations: `StaticScheduler` and `HathoraScheduler`.

### StaticScheduler

This is the default scheduler when running the backend server. It takes a static list of session server hosts via the `SESSION_SERVER_HOST` env var (comma delimited list for multiple hosts). `createRoom` randomly assigns the `roomId` to one of the hosts and stores the mapping in an in-memory map, and `getRoomHost` simply does a map lookup.

So while the `StaticScheduler` fully implements the `Scheduler` interface, it operates on a static list of session servers which imposes some key limitations:

1. There's no way to add additional session server capacity on demand (no horizontal scaling)
2. Not tolerant to session server crashes (it will continue assigning rooms to crashed servers)
3. The room mapping is stored in memory, and thus can't be safely scaled with multiple backend server replicas

### HathoraScheduler

> Discosure: I work on Hathora Cloud

This is the scalable, production ready scheduler which leverages the [Hathora](https://hathora.dev/docs) hosting platform. It's configured via the `HATHORA_APP_ID` and `HATHORA_TOKEN` env vars, and it interacts with the service using the [Hathora Typescript SDK](https://github.com/hathora/cloud-sdk-typescript).

These are the main features of Hathora which make it an ideal hosting platform for this use case:

1. _Direct container ingress_: each running container instance gets a unique host+port to connect to.
2. _Fast, API-driven container boots_: single API call to boot a container instance in under 5 seconds
3. _Room concurrency_: Hathora is "room aware" and assigns rooms to existing containers up to a configurable number of rooms per container

### Alternative schedulers

While there are only two scheduler implementations included in this project, more implementions could be added as long as they conform to the simple `Scheduler` interface. For example, it would be relatively straightforward to add a `KubernetesScheduler` implementation which created a new pod for every room.

## Running locally

### Clone the repository

```bash
git clone https://github.com/hpx7/scalable-chat
cd scalable-chat
```

### Start services

Each service should run in a different terminal tab. See individual instructions for [client](client), [backend-server](backend-server), and [session-server](session-server).
