import { Request, Response } from "express";
import { makeToken } from "../../auth.ts";
import { upsertUser } from "../../data-access/users.ts";

export const loginController = async (req: Request, res: Response) => {
  const { userId, username, email } = req.body;

  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  try {
    // Upsert user record
    const userData = {
      id: userId,
      username: username || null,
      email: email || null
    };
    
    const user = await upsertUser(userData);
    
    if (user.id === userId && !user.username && !user.email) {
      console.log(`New user created: ${userId}`);
    } else if (user.id === userId) {
      console.log(`User updated: ${userId}`);
    }

    const token = makeToken({ userId });
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
