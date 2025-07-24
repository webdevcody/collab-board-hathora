# Scalable Chat

A collaborative whiteboard application with real-time synchronization and persistent storage.

## Features

- Real-time collaborative drawing with shapes (rectangles, ovals, text, lines, arrows)
- User authentication and room management
- Persistent board storage with PostgreSQL
- WebSocket-based real-time updates
- Scalable architecture with separate backend and session servers

## Quick Start with Docker Compose

1. **Start the services:**

   ```bash
   docker-compose up -d
   ```

2. **Run database migrations:**

   ```bash
   cd backend-server
   npm run db:push
   ```

3. **Access the application:**
   - Backend API: http://localhost:8080
   - Frontend: http://localhost:3000 (when client is running)

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Docker (optional, for containerized development)

### Database Setup

#### Option 1: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL database
docker-compose up postgres -d

# Run database migrations
cd backend-server
npm run db:push
```

#### Option 2: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database named `scalable_chat`
3. Update the `DATABASE_URL` in `backend-server/.env`
4. Run migrations: `cd backend-server && npm run db:push`

### Backend Server

```bash
cd backend-server
npm install
npm start
```

The backend server provides:

- User authentication (`POST /api/login`)
- Board CRUD operations (`/api/boards`)
- Room management (`/api/rooms`)

### Session Server

```bash
cd session-server
npm install
JWT_SECRET="your-secret-key" npm start
```

The session server handles:

- Real-time WebSocket connections
- Collaborative drawing synchronization
- Board state persistence

### Client

```bash
cd client
npm install
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/login` - Authenticate user

### Boards

- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create a new board
- `GET /api/boards/:id` - Get specific board
- `PUT /api/boards/:id` - Update board data
- `DELETE /api/boards/:id` - Delete board

### Rooms (Legacy)

- `POST /api/rooms` - Create room with board
- `GET /api/rooms/:roomId` - Get room info

## Environment Variables

### Backend Server

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/scalable_chat"
JWT_SECRET="your-secret-key"
PORT=8080
SESSION_SERVER_HOST="localhost:8000"
```

### Session Server

```env
JWT_SECRET="your-secret-key"
PORT=8000
```

## Database Schema

The application uses a single `boards` table with the following structure:

- `id` - Serial primary key
- `name` - Board name
- `data` - JSONB containing shapes and cursors
- `hathora_room_id` - Associated room identifier
- `created_at` - Creation timestamp
- `updated_at` - Last modification timestamp

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│     Client      │◄──►│ Backend Server  │◄──►│   PostgreSQL    │
│   (React SPA)   │    │   (Express)     │    │   (Database)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │
│ Session Server  │◄──►│   Scheduler     │
│  (WebSocket)    │    │ (Hathora/Static)│
│                 │    │                 │
└─────────────────┘    └─────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
