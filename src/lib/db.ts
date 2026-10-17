import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

// Pooled connection (DATABASE_URL). Migrations use DATABASE_URL_UNPOOLED.
const globalForDb = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

attachDatabasePool(pool);
