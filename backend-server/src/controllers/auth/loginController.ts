import { Request, Response } from "express";
import { z } from "zod";
import { makeToken } from "../../auth.ts";
import { upsertUser } from "../../data-access/users.ts";

const loginSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  username: z.string().optional(),
  email: z.string().email().optional()
});

export const loginController = async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);
  
  // Upsert user record
  const userData = {
    id: validatedData.userId,
    username: validatedData.username || null,
    email: validatedData.email || null
  };
  
  const user = await upsertUser(userData);
  
  if (user.id === validatedData.userId && !user.username && !user.email) {
    console.log(`New user created: ${validatedData.userId}`);
  } else if (user.id === validatedData.userId) {
    console.log(`User updated: ${validatedData.userId}`);
  }

  const token = makeToken({ userId: validatedData.userId });
  res.json({ token });
};
