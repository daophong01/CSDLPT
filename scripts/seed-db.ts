import fs from "fs";
import path from "path";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL in env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 1,
});

async function runFile(client: import("pg").PoolClient, filePath: string) {
  const sql = fs.readFileSync(filePath, "utf-8");
  console.log("Running:", path.basename(filePath));
  await client.query(sql);
}

async function main() {
  const client = await pool.connect();
  try {
    const root = process.cwd();
    const files = [
      path.join(root, "db", "schema.sql"),
      path.join(root, "db", "fragmentation.sql"),
      path.join(root, "db", "offchain.sql"),
      path.join(root, "db", "roles.sql"),
      path.join(root, "db", "triggers.sql"),
      path.join(root, "db", "sample_data.sql"),
    ];

    for (const f of files) {
      if (!fs.existsSync(f)) {
        console.warn("Skip missing:", f);
        continue;
      }
      await runFile(client, f);
    }

    console.log("Database seeded successfully.");
  } catch (e: any) {
    console.error("Seed failed:", e.message || e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();