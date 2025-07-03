# Scalable Chat - Client

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

Start the development server ([Vite](https://vite.dev/)):

```bash
npm run dev
```

Access the application by visiting `http://localhost:5173`.

The dev server supports hot module replacement for instant updates.

> The [backend server](../backend-server/) must be running for the app to function

### Configuration

The dev server uses a [proxy](https://vite.dev/config/server-options.html#server-proxy) to communicate with the Backend Server over the same origin:

```ts
   proxy: {
      "/api": process.env.BACKEND_API ?? "http://localhost:8080",
   },
```

Optionally set the `BACKEND_API` environment variable to override the backend address:

```bash
BACKEND_API=http://localhost:9090 npm run dev
```

## Production Deployment

```bash
npm run build
```

This creates an optimized build in the `dist/` directory ready for deployment to any static hosting service (S3, Vercel, Netlify, etc).

> You'll need to configure your hosting service to route `/api` requests to wherever your production backend server is hosted
