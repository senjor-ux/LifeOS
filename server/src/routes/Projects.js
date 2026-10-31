const express = require("express");
const pool = require("../config/db");
const requireAuth = require("../middleware/Auth");

const router = express.Router();

const projSchema = async ({
  user_id,
  name,
  description = null,
  status = "todo",
  priority = "normal",
  start_date = null,
  target_date = null,
}) => {
  const result = await pool.query(
    `
      INSERT INTO projects (user_id, name, description, status, priority, start_date, target_date, created_at, updated_at)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`[
      (user_id, name, description, status, priority, start_date, target_date)
    ],
  );
};

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      priority,
      start_date,
      target_date,
      updated_at,
    } = req.body;

    await projSchema(req.session.user.id, name, description, status, priority, start_date, target_date)
  } catch (err) {
    console.log("Project upload failed");

    res.status(500).json("project upload failed");
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.session.user.id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "No project found" });

    return res
      .status(200)
      .json({ message: "Projects retrieved", projects: result.rows });
  } catch (err) {
    console.error("Failed retrieving projects:", err);

    return res.status(500).json({ message: "Failed retrieving projects" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const proj_id = req.params.id;

    const result = await pool.query(
      `
        SELECT * FROM projects where id = $1 and user_id = $2`,
      [proj_id, req.session.user.id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "No project found" });
  } catch (err) {
    console.error("Failed retrieving project:", err);

    return res.status(500).json({ message: "Failed retrieving project" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  const proj_id = req.params.id;
});

router.delete("/:id", requireAuth, async (req, res) => {
  const proj_id = req.params.id;
});
