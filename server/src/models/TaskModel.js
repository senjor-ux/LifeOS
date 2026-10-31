const pool = require("../config/db");

async function createTask(data) {
  const result = await pool.query(
    `INSERT INTO tasks (user_id, title, description, status, priority, due_date, scheduled_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    data,
  );

  return result.rows[0];
}

async function getTasks(user_id) {
  const result = await pool.query(
    `SELECT * FROM tasks
    WHERE user_id = $1
    ORDER BY created_at DESC`,
    [user_id],
  );

  return result.rows;
}

async function getTaskById(task_id, user_id) {
  const result = await pool.query(
    `SELECT * FROM tasks
     WHERE id = $1 AND user_id = $2`,
    [task_id, user_id],
  );

  return result.rows[0];
}

async function updateTask(task_id, user_id, updates) {
  const allowedFields = ["due_date", "scheduled_date", "priority", "status"];

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
      UPDATE tasks
      SET ${field}, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `,
    [task_id, user_id, ...values],
  );

  return result.rows[0];
}

async function deleteTask(task_id, user_id) {
  const result = await pool.query(
    `DELETE FROM tasks
        WHERE id = $1
            AND user_id = $2
        RETURNING *
    `,
    [task_id, user_id],
  );

  return result.rows[0];
}

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
