//db/dev/pool.js

import { Pool } from 'pg';

import dotenv from 'dotenv';

// searches for the local .env file
dotenv.config();

const databaseConfig = { connectionString: process.env.DATABASE_URL };

// create a new instance of Pool using env values
const pool = new Pool(databaseConfig);

export default pool;