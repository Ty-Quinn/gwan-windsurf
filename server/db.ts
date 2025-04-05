
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './models/user';
import * as matchSchema from './models/match';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gwan_game',
});

// Initialize Drizzle with all schemas
export const db = drizzle(pool, { 
  schema: {
    ...schema,
    ...matchSchema
  } 
});
