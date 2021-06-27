//db/dev/pool.js

import pkg from 'pg';
const { Pool } = pkg;
// import { Pool } from 'pg';

import dotenv from 'dotenv';

// searches for the local .env file
dotenv.config();

const databaseConfig = { connectionString: process.env.DATABASE_URL };

// create a new instance of Pool using env values
const pool = new Pool(databaseConfig);

export default pool;