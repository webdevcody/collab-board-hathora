# Chat Demo

A real-time chat application built with React, TypeScript, and WebSockets, powered by Hathora Cloud for session management.

## Architecture

This project consists of three main components:

- **Client** - React frontend with TypeScript and Vite
- **Backend Server** - Express.js API server for authentication and room management
- **Session Server** - WebSocket server for real-time chat functionality

## Features

- **User Authentication** - JWT-based login system
- **Room Management** - Create and join chat rooms
- **Real-time Messaging** - WebSocket-powered live chat
- **User Presence** - See who's currently in the room
- **Message Timestamps** - All messages include send time
- **Modern UI** - Glassmorphism design with responsive layout
- **Mobile Friendly** - Optimized for mobile devices

## Tech Stack

### Frontend

- React 19
- TypeScript
- React Router 7
- CSS Modules with modern styling
- Vite for development and building

### Backend

- Express.js
- JSON Web Tokens (JWT)
- Hathora Cloud SDK for session management

### Session Server

- WebSocket (ws library)
- JWT authentication
- Real-time message broadcasting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chat-demo
   ```

2. **Install dependencies for all services**

   ```bash
   # Client
   cd client
   npm install

   # Backend Server
   cd ../backend-server
   npm install

   # Session Server
   cd ../session-server
   npm install
   ```

3. **Environment Setup**
   Configure your Hathora Cloud credentials and other environment variables as needed.

4. **Start the development servers**

   Start each service in separate terminals:

   ```bash
   # Backend Server (terminal 1)
   cd backend-server
   npm start

   # Session Server (terminal 2)
   cd session-server
   npm start

   # Client (terminal 3)
   cd client
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5173` (or the port shown by Vite)

## Usage

1. **Login** - Enter a username to create a JWT token
2. **Create Room** - Start a new chat room
3. **Join Room** - Enter a room ID to join an existing room
4. **Chat** - Send messages in real-time with other users
5. **Navigate** - Use "Back to Lobby" to return to the main screen

## Project Structure

```
chat-demo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── styles/         # CSS modules
│   │   ├── backendClient.ts
│   │   ├── sessionClient.ts
│   │   └── main.tsx
│   └── package.json
├── backend-server/         # Express API server
│   ├── src/
│   │   ├── auth.ts
│   │   ├── scheduler.ts
│   │   └── server.ts
│   └── package.json
├── session-server/         # WebSocket server
│   ├── src/
│   │   ├── auth.ts
│   │   ├── room.ts
│   │   └── server.ts
│   └── package.json
└── README.md
```

## Component Architecture

The React components follow a modular design pattern with co-located sub-components:

- **Auth** - Handles login/logout with AuthHeader and Login sub-components
- **Lobby** - Main lobby with CreateRoomSection and JoinRoomSection
- **Session** - Room connection management with SessionHeader and StatusMessage
- **Room** - Chat interface with UserList, MessageList, and MessageInput

## Styling

The application uses a modern CSS architecture with:

- **Global styles** - Base styling and animations
- **Component-specific CSS** - Modular stylesheets
- **Glassmorphism effects** - Modern translucent design
- **Responsive design** - Mobile-first approach
- **CSS custom properties** - Consistent theming

## API Endpoints

### Backend Server

- `POST /api/login` - User authentication
- `POST /api/rooms` - Create new room
- `POST /api/rooms/:roomId` - Get or start room session

### Session Server

- WebSocket connection with JWT token authentication
- Real-time message broadcasting
- User presence management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
