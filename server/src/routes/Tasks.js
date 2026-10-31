const express = require("express");
const pool = require("../config/db");
const requireAuth = require("../middleware/Auth");

const router = express.Router();

// tasks schema (creates stuff in database)
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

// post schema (to create stuff)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, description, status, priority, due_date, scheduled_date } =
      req.body;

    // the only acceptable status and priorities
    const validStatuses = ["inbox", "todo", "in_progress", "done"];
    const validPriorities = ["low", "normal", "high", "urgent"];

    // checks if title exists
    if (!title || typeof title !== "string" || !title.trim())
      return res.status(400).json({ message: "Title required" });

    // checks if status are valid
    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    // checks if priority are valid
    if (priority !== undefined && !validPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    // creates task
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
    // checks for any errors
    console.error("Creating task failed:", err);

    return res.status(500).json({
      message: "Creating task failed",
    });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.session.user.id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "No task found" });

    return res
      .status(200)
      .json({ message: "Tasks retrieved", tasks: result.rows });
  } catch (err) {
    console.error("Failed retrieving task:", err);

    return res.status(500).json({ message: "Failed retrieving tasks" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const task_id = req.params.id;
    const result = await pool.query(
      `
    SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
      [task_id, req.session.user.id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "No task found" });

    return res
      .status(200)
      .json({ message: "Task retrieved", task: result.rows[0] });
  } catch (err) {
    console.error("Failed retrieving tasks:", err);

    return res.status(500).json({ message: "Failed retrieving task" });
  }
});

// function for updating task
const update = async (field, values) => {
  const result = await pool.query(
    `
        UPDATE tasks
        SET ${field} updated_at = NOW()
        WHERE id = $1
            AND user_id = $2
        RETURNING *
    `,
    values,
  );

  return result.rows[0];
};

// update task with tasks id
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const task_id = req.params.id;
    const request = req.body;

    // the only fields that can be updated
    const allowedFields = ["due_date", "scheduled_date", "priority", "status"];

    // check if anything is being updated (can't be empty)
    if (Object.keys(request).length === 0)
      return res.status(400).json({ message: "Cannot edit nothing" });

    // checks if there's anything is invalid
    const invalidField = Object.keys(request).find(
      (key) => !allowedFields.includes(key),
    );

    if (invalidField) {
      return res.status(400).json({
        message: `Cannot edit unauthorized field: ${invalidField}`,
      });
    }

    // used for data base to update gonna look like this "due_date = $3" or longer
    let field = "";
    // value of "due_date" will be 2026-10-31
    let values = [task_id, req.session.user.id];
    // number for "$3"
    let num = 0;

    // loops through given data
    Object.entries(request).forEach((x) => {
      // adds values to values field so to due_date gonna give date
      values.push(x[1]);

      // into field gives "due_date = $3"
      field += `${x[0]} = $${num + 3}, `;
      // adds one to $3 and makes it $4 for another value
      num++;
    });

    // valid statuses and priorities
    const validStatuses = ["inbox", "todo", "in_progress", "done"];
    const validPriorities = ["low", "normal", "high", "urgent"];

    // if status not given don't let through
    if (
      req.body.status !== undefined &&
      !validStatuses.includes(req.body.status)
    ) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    // if priority not given don't let through
    if (
      req.body.priority !== undefined &&
      !validPriorities.includes(req.body.priority)
    ) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    // tries calling update function and gives field and values
    const task = await update(field, values);

    // when calling if task doesn't exist throw error
    if (!task) return res.status(404).json({ message: "Task doesn't exist" });

    // success
    return res.status(200).json({ message: "Task updated", task });
  } catch (err) {
    // checking for errors
    console.log("Error while updating task", err);
    res.status(500).json({ message: "Updating task failed" });
  }
});

// delete task with task id route
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;

    // delete task
    const result = await pool.query(
      `
        DELETE FROM tasks
        WHERE $1 = id
            AND user_id = $2
        RETURNING *
    `,
      [id, req.session.user.id],
    );

    // can't delete not existant task
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Task doesn't exist" });

    // success
    res.status(200).json({ message: "Task deleted", task: result.rows[0] });
  } catch (err) {
    // check for errors
    console.log("Failed deleting task", err);
    res.status(500).json({ message: "Failed deleting task" });
  }
});

module.exports = router;
