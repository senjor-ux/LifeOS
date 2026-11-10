const pool = require("../config/db");

function acceptableObject(obj) {
  const acceptableLinks = ["task", "goal", "project"];
  const contains = acceptableLinks.includes(obj);

  return contains;
}

async function createLink(object, note_id, object_id, user_id) {
  if (!acceptableObject(object)) throw new Error(`Invalid update field`);

  const result = await pool.query(
    `INSERT INTO note_links (note_id, ${object}_id)
    SELECT notes.id, ${object}s.id
        FROM notes
    INNER JOIN ${object}s
        ON ${object}s.user_id = notes.user_id
    WHERE notes.id = $1
        AND ${object}s.id = $2
        AND notes.user_id = $3
    RETURNING *
     `,
    [note_id, object_id, user_id],
  );

  return result.rows[0];
}

async function getLink(object, object_id, user_id) {
  if (!acceptableObject(object)) throw new Error(`Invalid update field`);

  const result = await pool.query(
    `
        SELECT * FROM note_links
        INNER JOIN ${object}s
            ON note_links.${object}_id = ${object}.id
        WHERE note_link.${object}_id = $1
            AND ${object}s.user_id = $2`,
    [object_id, user_id],
  );

  return result.rows;
}

async function deleteLink(object, object_id, note_id, user_id) {
  if (!acceptableObject(object)) throw new Error(`Invalid update field`);

  const result = await pool.query(
    `DELETE FROM note_links
        USING ${object}s
        WHERE note_link.${object}_id = $1
            AND note_links.note_id = $2
            AND ${object}s.user_id = $3`,
    [object_id, note_id, user_id],
  );

  return result.rows[0]
}

module.exports = { createLink, getLink, deleteLink };
