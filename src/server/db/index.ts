import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { env } from "~/env";

export const client = new Client({
  connectionString: env.DATABASE_URL,
});

await client.connect();

export const db = drizzle(client, { schema });
