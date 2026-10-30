const express = require("express");
const pool = require("../config/db");
const requireAuth = require("../middleware/Auth");
const router = express.Router();

const taskModel = async ({
  user_id,
  title,
  description = null,
  status = "todo",
  priority = "normal",
  due_date = null,
  scheduled_date = null,
}) => {
  const result = await pool.query(
    `
        INSERT INTO tasks (user_id, title, description, status, priority, due_date, scheduled_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
    [user_id, title, description, status, priority, due_date, scheduled_date],
  );

  return result.rows[0];
};

router.post("/add", requireAuth, async (req, res) => {
  try {
    const { title, description, status, priority, due_date, scheduled_date } =
      req.body;

    const validStatuses = ["inbox", "todo", "in_progress", "done"];
    const validPriorities = ["low", "normal", "high", "urgent"];

    if (!title || typeof title !== "string" || !title.trim())
      return res.status(400).json({ message: "Title required" });

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    if (priority !== undefined && !validPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    const task = await taskModel({
      user_id: req.session.user.id,
      title: title.trim(),
      description,
      status,
      priority,
      due_date,
      scheduled_date,
    });

    return res.status(201).json({
      message: "Task made successfully",
      task,
    });
  } catch (err) {
    console.error("Creating task failed:", err);

    return res.status(500).json({
      message: "Creating task failed",
    });
  }
});

const update = async ({
  task_id,
  user_id,
  due_date = undefined,
  scheduled_date = undefined,
  priority = undefined,
  status = undefined,
}) => {
  const result = await pool.query(
    `
        UPDATE tasks
        SET due_date = $3, scheduled_date = $4, priority = $5, status = $6
        WHERE $1 = id
            AND user_id = $2
        RETURNING *
    `,
    [task_id, user_id, due_date, scheduled_date, priority, status],
  );

  return result.rows[0];
};

router.post("/update/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;

    const validStatuses = ["inbox", "todo", "in_progress", "done"];
    const validPriorities = ["low", "normal", "high", "urgent"];

    if (
      req.body.status !== undefined &&
      !validStatuses.includes(req.body.status)
    ) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    if (
      req.body.priority !== undefined &&
      !validPriorities.includes(req.body.priority)
    ) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    const task = await update({
      task_id: id,
      user_id: req.session.user.id,
      due_date: req.body.due_date,
      scheduled_date: req.body.scheduled_date,
      priority: req.body.priority,
      status: req.body.status,
    });

    if (!task) return res.status(404).json({ message: "Task doesn't exist" });

    return res.status(200).json({ message: "Task updated", task });
  } catch (err) {
    console.log("Error while updating task", err);
    res.status(500).json({ message: "Updating task failed" });
  }
});

router.delete("/delete/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;

    const result = await pool.query(
      `
        DELETE FROM tasks
        WHERE $1 = id
            AND user_id = $2
        RETURNING *
    `,
      [id, req.session.user.id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Task doesn't exist" });

    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    console.log("Failed deleting task", err);
    res.status(500).json({ message: "Failed deleting task" });
  }
});

module.exports = router;
