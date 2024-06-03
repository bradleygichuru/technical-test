import { Client, Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  ssl: true,
  //idleTimeoutMillis: 30000,
  //connectionTimeoutMillis: 2000,
});
export const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: true,
});
