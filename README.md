# Chat Demo

An open-source chat application to demonstrate the stateful routing pattern for building scalable real-time applications.

<img width="350" alt="Screenshot1" src="https://github.com/user-attachments/assets/143d8839-9f3d-4b49-80a8-af36ef97e100" />

<img width="350" alt="Screenshot2" src="https://github.com/user-attachments/assets/92eb6ad6-cd8c-4528-bef1-c19af384ee25" />

[Live demo](https://d5huis9tac6kp.cloudfront.net/)

## Architecture

### Overview

This project consists of three main components:

- **Client** - React single-page application
- **Backend Server** - Express.js API server for authentication and room management
  - Scheduler - Module inside the Backend Server for interfacing with the Session Server. This project includes two Scheduler implementations:
    1. `LocalScheduler` for statically defined session server instances (e.g. for local development)
    2. `HathoraScheduler` for dynamically created session server instances running on [Hathora Cloud](https://hathora.dev/docs)
- **Session Server** - Node.js WebSocket server for real-time chat functionality

<img width="532" alt="Architecture" src="https://github.com/user-attachments/assets/bfd36a9f-44ea-4bec-95af-2bf7fe881d7a" />

### Deployment Topolgy

- **Client** - Collection of static files deployed on a CDN. This project [deploys to AWS S3 + Cloudfront](.github/workflows/client-deploy.yml)
- **Backend Server** - Stateless Docker container with multiple replicas deployed behind a load balancer. This project [deploys to AWS ECS Fargate](.github/workflows/backend-server-deploy.yml)
- **Session Server** - Stateful Docker container with instances spawned on-demand and direct container ingress. This project [deploys to Hathora Cloud](.github/workflows/session-server-deploy.yml)

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

1. The client requests the backend server for the session server instance url corresponding to a `roomId`
2. The backend server queries the scheduler module and responds with the url (or 404 if not found)
3. The client establishes a bi-directional connection with the session server instance using the url

## Developing

### Clone the repository

```bash
git clone https://github.com/hpx7/chat-demo
cd chat-demo
```

### Start services

Each service should run in a different terminal tab. See individual instructions for [client](client), [backend-server](backend-server), and [session-server](session-server).
