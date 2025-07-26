# Authentication System

## Overview

This system implements secure authentication between the session server and backend API, supporting both client JWT tokens and session server tokens.

## Environment Variables

Both the backend server and session server need the following environment variables:

### Backend Server (.env)

```bash
# JWT secret for client authentication tokens
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Shared secret for session server to backend authentication
SESSION_SERVER_SECRET=your-session-server-secret-here-change-this-in-production

# Database and other config...
DATABASE_URL=postgres://user:password@localhost:5432/scalable_chat
PORT=8080
```

### Session Server (.env)

```bash
# Shared secret for authenticating with the backend API (must match backend)
SESSION_SERVER_SECRET=your-session-server-secret-here-change-this-in-production

# Backend API URL
BACKEND_URL=http://localhost:8080

# Hathora and other config...
HATHORA_APP_ID=your-hathora-app-id
HATHORA_DEV_TOKEN=your-hathora-dev-token
PORT=7777
```

## How It Works

### Authentication Types

1. **Client Tokens**: JWT tokens issued to users after login, containing `userId`
2. **Session Server Tokens**: JWT tokens used by the session server to authenticate with the backend

### Middleware

- `authMiddleware`: Accepts both client and session server tokens
- `clientAuthMiddleware`: Only accepts client tokens (for user-specific operations)

### API Requests

The session server automatically adds authorization headers to all backend API requests using session server tokens.

### Route Protection

The `/api/boards/by-room/:roomId` route now uses `authMiddleware` and will:

- Accept valid client tokens (for user access)
- Accept valid session server tokens (for session server access)
- Reject invalid/missing tokens with 401 status

## Security

- Client tokens contain user identification for access control
- Session server tokens bypass user ownership checks for collaborative features
- Both token types use separate secrets for security isolation
- All API communications require valid authentication

## Usage

Once environment variables are set, the system works automatically:

1. Session server generates tokens on each API request
2. Backend middleware validates tokens and sets request context
3. Routes handle both client and session server access appropriately
