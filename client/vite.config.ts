import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.BACKEND_API ?? "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
