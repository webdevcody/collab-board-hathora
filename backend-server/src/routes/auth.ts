import { Router } from "express";
import { makeToken, getUserId } from "../auth.ts";
import { db } from "../db/connection.ts";
import { users, type InsertUser } from "../db/schema.ts";
import { eq } from "drizzle-orm";

const router = Router();

// login
router.post("/login", async (req, res) => {
  const { userId, username, email } = req.body;

  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  try {
    // Upsert user record
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userRecord.length === 0) {
      // Create new user
      const newUser: InsertUser = {
        id: userId,
        username: username || null,
        email: email || null,
      };
      await db.insert(users).values(newUser);
      console.log(`New user created: ${userId}`);
    } else {
      // Update existing user if username or email provided
      const updates: Partial<InsertUser> = {};
      if (username !== undefined) updates.username = username;
      if (email !== undefined) updates.email = email;

      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where(eq(users.id, userId));
        console.log(`User updated: ${userId}`);
      }
    }

    const token = makeToken({ userId });
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
