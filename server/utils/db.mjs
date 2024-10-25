import pkg from "pg";
import dotenv from "dotenv";

//get environment parameter
dotenv.config({ path: "../.env" });
const { Pool } = pkg;

const connectionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000, //close connection in 30s after idle
  connectionTimeoutMillis: 2000, //return error in 2s after fail connection
});

export default connectionPool; //export for routers
