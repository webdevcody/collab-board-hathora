import {
  pgTable,
  serial,
  text,
  jsonb,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Using text ID to match userId in JWTs
  username: text("username"),
  email: text("email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(), // Track board owner
  data: jsonb("data")
    .$type<{
      shapes: Array<{
        id: string;
        type: "rectangle" | "oval" | "text" | "line" | "arrow";
        x: number;
        y: number;
        width: number;
        height: number;
        userId: string;
        timestamp: string;
        text?: string;
        fill?: string;
        stroke?: string;
        rotation?: number;
      }>;
      cursors: Array<{
        userId: string;
        x: number;
        y: number;
        timestamp: string;
      }>;
    }>()
    .notNull()
    .default({ shapes: [], cursors: [] }),
  hathoraRoomId: varchar("hathora_room_id", { length: 256 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type InsertBoard = typeof boards.$inferInsert;
export type SelectBoard = typeof boards.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
