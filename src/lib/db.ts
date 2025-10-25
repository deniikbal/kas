import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './db/schema'

const connectionString = process.env.DATABASE_URL!

// Configure postgres client with longer timeout for Neon serverless
const client = postgres(connectionString, {
  prepare: false,
  connect_timeout: 30,
  idle_timeout: 30,
  max_lifetime: 60 * 30,
  max: 10,
})

export const db = drizzle(client, { schema })