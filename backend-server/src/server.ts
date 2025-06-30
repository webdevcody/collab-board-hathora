import express from "express";
import { makeToken, getUserId } from "./auth.ts";
import { scheduler } from "./scheduler.ts";

const app = express();
app.use(express.json());

// login
app.post("/api/login", (req, res) => {
  const userId = req.query.userId;
  const token = makeToken({ userId });
  res.json({ token });
});

// createRoom
app.post("/api/rooms", async (req, res) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(403);
    return;
  }
  const roomId = await scheduler.createRoom();
  console.log(`Room ${roomId} created by user ${userId}`);
  res.json({ roomId });
});

// lookupRoom
app.get("/api/rooms/:roomId", async (req, res) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(403);
    return;
  }
  const roomId = req.params.roomId;
  const url = await scheduler.getRoomUrl(roomId);
  if (url == null) {
    res.sendStatus(404);
    return;
  }
  const token = makeToken({ userId, roomId }, url);
  res.json({ url, token });
});

const port = process.env.PORT ?? 8080;
app.listen(port).once("listening", () => {
  console.log(`Listening on *:${port}`);
});
