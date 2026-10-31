const pool = require("../config/db");

async function getUser(email) {
  const result = await pool.query(
    `SELECT id, username, email, password_hash
       FROM users
       WHERE email = $1`,
    [email],
  );

  return result.rows[0];
}

async function register(credentials) {
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, username, email`,
    credentials,
  );

  return result.rows[0];
}

module.exports = { register, getUser };
