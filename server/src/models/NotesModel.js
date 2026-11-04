const pool = require("../config/db");

async function createNote(data) {
  const result = await pool.query(
    `INSERT INTO notes (user_id, title, content)
    VALUES ($1, $2, $3)
    RETURNING *`,
    data,
  );

  return result.rows[0];
}

async function getNotes(user_id) {
  const result = await pool.query(
    `SELECT * FROM notes
    WHERE user_id = $1`,
    [user_id],
  );

  return result.rows;
}

async function getNote(note_id, user_id) {
  const result = await pool.query(
    `SELECT * FROM notes
    WHERE id = $1
    AND user_id = $2`,
    [note_id, user_id],
  );

  return result.rows[0];
}

async function updateNote(note_id, user_id, updates) {
  const allowedFields = ["title", "content"];

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
    `UPDATE notes
      SET ${field}, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `,
    [note_id, user_id, ...values],
  );

  return result.rows[0];
}

async function deleteNote(note_id, user_id) {
  const result = await pool.query(
    `DELETE FROM notes 
    WHERE id = $1
    AND user_id = $2`,
    [note_id, user_id],
  );

  return result.rows[0];
}

module.exports = { createNote, getNotes, getNote, updateNote, deleteNote };
