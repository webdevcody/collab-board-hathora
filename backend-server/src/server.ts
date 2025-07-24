import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.ts";
import boardRoutes from "./routes/boards.ts";
import roomRoutes from "./routes/rooms.ts";

const app = express();
app.use(express.json());

// Mount route modules
app.use("/api", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/rooms", roomRoutes);

const port = process.env.PORT ?? 8080;
app.listen(port).once("listening", () => {
  console.log(`Listening on *:${port}`);
});
