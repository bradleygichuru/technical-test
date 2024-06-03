const dotenv = require("dotenv");
dotenv.config();
//initialize Postgres pool instance
const pg = require("pg");

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  ssl: true,
  //idleTimeoutMillis: 30000,
  //connectionTimeoutMillis: 2000,
});
test("Ensure proper seeding of admin user", async () => {
  const data = await check();
  expect(data).toBe(true);
});
async function check() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM users WHERE email=$1", [
      "johndoe@gmail.com",
    ]);
    return result.rows[0].is_admin;
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
  }
}
