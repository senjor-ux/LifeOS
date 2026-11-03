const pool = require("../config/db");

async function createGoal(data) {
  const result = await pool.query(
    `INSERT INTO goals (user_id, title, description, reason, status, start_date, target_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    data,
  );

  return result.rows[0];
}

async function updateGoal(goal_id, user_id, updates) {
  const allowedFields = [
    "title",
    "description",
    "status",
    "reason",
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
    `UPDATE goals
      SET ${field}, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `,
    [goal_id, user_id, ...values],
  );

  return result.rows[0];
}

async function getGoals(user_id) {
  const result = await pool.query(
    `SELECT * FROM goals
        WHERE user_id = $1`,
    [user_id],
  );

  return result.rows;
}

async function getOneGoal(goal_id, user_id) {
  const result = await pool.query(
    `SELECT * FROM goals
    WHERE id = $1 AND user_id = $2`,
    [goal_id, user_id],
  );

  return result.rows[0];
}

async function deleteGoal(goal_id, user_id) {
  const result = await pool.query(
    `DELETE FROM goals
        WHERE id = $1 AND user_id = $2
        RETURNING *`,
    [goal_id, user_id],
  );

  return result.rows[0];
}

module.exports = { createGoal, updateGoal, getGoals, getOneGoal, deleteGoal };
