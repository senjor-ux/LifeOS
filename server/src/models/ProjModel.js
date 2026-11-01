const pool = require("../config/db");

async function createProj(data) {
  const result = await pool.query(
    `INSERT INTO projects (user_id, name, description, status, priority, start_date, target_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    data,
  );

  return result.rows[0];
}

async function updateProj(proj_id, user_id, updates) {
  const allowedFields = [
    "name",
    "description",
    "status",
    "priority",
    "start_date",
    "target_date",
  ];

  if (Object.keys(updates).length === 0) {
    throw new Error("No fields to update");
  }

  const invalidField = Object.keys(updates).find(
    (key) => !allowedFields.includes(key),
  );

  if (invalidField) {
    throw new Error(`Invalid update field: ${invalidField}`);
  }

  const values = [];

  const field = Object.entries(updates)
    .map(([key, value], index) => {
      values.push(value);
      return `${key} = $${index + 3}`;
    })
    .join(", ");

  const result = await pool.query(
    `
      UPDATE projects
      SET ${field}, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `,
    [proj_id, user_id, ...values],
  );

  return result.rows[0];
}

async function deleteProj(proj_id, user_id) {
  const result = await pool.query(
    `DELETE FROM projects
        WHERE id = $1
            AND user_id = $2
        RETURNING *
    `,
    [proj_id, user_id],
  );

  return result.rows[0];
}

async function getProj(user_id) {
  const result = await pool.query(
    `SELECT * FROM projects
    WHERE user_id = $1
    ORDER BY created_at DESC`,
    [user_id],
  );

  return result.rows;
}

async function getOneProj(proj_id, user_id) {
  const result = await pool.query(
    `SELECT * FROM projects
     WHERE id = $1 AND user_id = $2`,
    [proj_id, user_id],
  );

  return result.rows[0];
}

module.exports = {
  createProj,
  updateProj,
  deleteProj,
  getProj,
  getOneProj,
};