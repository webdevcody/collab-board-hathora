# Chat Demo

A chat application to demonstrate the stateful routing pattern for building scalable real-time applications.

<img width="350" alt="Image" src="https://github.com/user-attachments/assets/143d8839-9f3d-4b49-80a8-af36ef97e100" />

<img width="350" alt="Image" src="https://github.com/user-attachments/assets/92eb6ad6-cd8c-4528-bef1-c19af384ee25" />

## Architecture

### Overview

This project consists of three main components:

- **Client** - React single-page application
- **Backend Server** - Express.js API server for authentication and room management
- **Session Server** - Node.js WebSocket server for real-time chat functionality

<img width="350" alt="Image" src="https://github.com/user-attachments/assets/0171c286-df58-4081-8c18-49b6eea9d2af" />

### Deployment Topolgy

- **Client** - Collection of static files deployed on a CDN. This project [deploys to AWS S3 + Cloudfront](.github/workflows/client-deploy.yml)
- **Backend Server** - Stateless Docker container with multiple replicas deployed behind a load balancer. This project [deploys to AWS ECS Fargate](.github/workflows/backend-server-deploy.yml)
- **Session Server** - Stateful Docker container with instances spawned on-demand and direct container ingress. This project [deploys to Hathora Cloud](.github/workflows/session-server-deploy.yml)

## Data Flow

### Create New Room

<img width="350" alt="Image" src="https://github.com/user-attachments/assets/9af6e1e7-763b-4004-a2bb-ff323f0a493b" />

1. The client requests the backend server for a new chat room session
2. The backend server forwards the request to the scheduler
3. The scheduler allocates the room to an existing session server instance with capacity or spawns a new one
4. The scheduler responds with the session server instance url
5. The backend server forwards to response to the client
6. The client establishes a bi-directional connection with the session server instance

### Join Existing Room

1. The client requests the backend server for the session server instance url corresponding to a roomId
2. The backend server queries the scheduler and responds with the url (or 404 if not found)
3. The client establishes a bi-directional connection with the session server instance

## API Endpoints

### Backend Server

- `POST /api/login` - Log in with username (responds with jwt token)
- `POST /api/rooms` - Create new room (responds with roomId)
- `POST /api/rooms/:roomId` - Lookup session server for roomId (responds with url)

### Session Server

- WebSocket connection with JWT token authentication
- Real-time message broadcasting
- User presence management

## Developing Locally

### Clone the repository

```bash
git clone <repository-url>
cd chat-demo
```

### Start services

Each service should run in a different terminal tab. See individual instructions for [client](client), [backend-server](backend-server), and [session-server](session-server).
