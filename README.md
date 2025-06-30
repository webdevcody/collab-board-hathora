# Chat Demo

A chat application to demonstrate the stateful routing pattern for building scalable real-time applications.

## Architecture

This project consists of three main components:

- **Client** - React single page application
- **Backend Server** - Express.js API server for authentication and room management
- **Session Server** - WebSocket server for real-time chat functionality

## Flow

1. The client authenticates with the backend server
2. The client requests the backend server for a chat room session
3. The backend server responds with a session server instance url corresponding to a roomId
4. The client establishes a WebSocket connection to the session server instance
5. All clients belonging to a given roomId connect to the same session server instance

## Developing Locally

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
