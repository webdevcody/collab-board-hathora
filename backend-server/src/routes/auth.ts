import { Router } from "express";
import { makeToken, getUserId } from "../auth.ts";

const router = Router();

// login
router.post("/login", (req, res) => {
  const userId = req.body.userId;
  const token = makeToken({ userId });
  res.json({ token });
});

export default router;
