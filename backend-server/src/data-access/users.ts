import { db } from "../db/connection.ts";
import { users, type InsertUser } from "../db/schema.ts";
import { eq } from "drizzle-orm";

export const getUserById = async (userId: string) => {
  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return userRecord[0] || null;
};

export const createUser = async (userData: InsertUser) => {
  const [newUser] = await db.insert(users).values(userData).returning();
  return newUser;
};

export const updateUser = async (userId: string, updates: Partial<InsertUser>) => {
  const [updatedUser] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();
  
  return updatedUser;
};

export const upsertUser = async (userData: InsertUser) => {
  const existingUser = await getUserById(userData.id);
  
  if (!existingUser) {
    return await createUser(userData);
  } else {
    const updates: Partial<InsertUser> = {};
    if (userData.username !== undefined) updates.username = userData.username;
    if (userData.email !== undefined) updates.email = userData.email;
    
    if (Object.keys(updates).length > 0) {
      return await updateUser(userData.id, updates);
    }
    
    return existingUser;
  }
}; 