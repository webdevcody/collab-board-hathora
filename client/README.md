# Chat Demo - Client

The client is a React single-page application built with TypeScript that provides the user interface for the chat application.

## Local Development

### Prerequisites

- Node.js (v18 or higher)

### Installation

**Install dependencies**

```bash
cd client
npm install
```

### Running

Start the development server (Vite):

```bash
npm run dev
```

Access the application by visiting `http://localhost:5173`.

The dev server supports hot module replacement for instant updates.

### Configuration

The dev server uses a proxy to communicate with the Backend Server over the same origin:

```ts
   proxy: {
      "/api": {
         target: process.env.BACKEND_API ?? "http://localhost:8080",
         changeOrigin: true,
      },
   },
```

Optionally set the `BACKEND_API` environment variable to point the client to an alternate backend address:

```bash
BACKEND_API=http://localhost:9090 npm run dev
```

## Production Deployment

```bash
npm run build
```

This creates an optimized build in the `dist/` directory ready for deployment to any static hosting service (S3, Vercel, Netlify, etc).
