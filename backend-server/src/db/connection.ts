import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema.js";

export const client = new Client({
  connectionString: process.env.DATABASE_URL
});

// Connect to the database
await client.connect();

// { schema } is used for relational queries
export const db = drizzle(client, { schema });
