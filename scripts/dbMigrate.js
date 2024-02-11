import { config } from "dotenv";
config();

import pg from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";

const main = async () => {
  const client = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });
  const db = drizzle(client);

  await migrate(db, { migrationsFolder: "./drizzle" });

  process.exit(0);
};

main().catch((error) => {
  console.log("Migration failed");
  console.error(error);
  process.exit(1);
});
