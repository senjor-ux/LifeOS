const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../models/TaskModel");

async function getAllTasks(req, res) {
  try {
    const result = await getTasks(req.session.user.id);

    return res.status(200).json({ message: "Tasks retrieved", tasks: result });
  } catch (err) {
    console.error("Failed retrieving task:", err);

    return res.status(500).json({ message: "Failed retrieving tasks" });
  }
}

async function getOneTask(req, res) {
  try {
    const task_id = req.params.id;

    const result = await getTaskById(task_id, req.session.user.id);

    if (!result) return res.status(404).json({ message: "No task found" });

    return res.status(200).json({ message: "Task retrieved", task: result });
  } catch (err) {
    console.error("Failed retrieving tasks:", err);

    return res.status(500).json({ message: "Failed retrieving task" });
  }
}

async function createNewTask(req, res) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      return res.status(400).json({ message: "Invalid request body" });

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

    const result = await createTask({
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
      task: result,
    });
  } catch (err) {
    console.error("Creating task failed:", err);

    return res.status(500).json({
      message: "Creating task failed",
    });
  }
}

async function updateExistingTask(req, res) {
  try {
    const task_id = req.params.id;
    const updates = req.body;

    if (!updates || typeof updates !== "object" || Array.isArray(updates))
      return res.status(400).json({ message: "Invalid request body" });

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "Cannot edit nothing" });
    const allowedFields = ["due_date", "scheduled_date", "priority", "status"];

    const invalidField = Object.keys(updates).find(
      (key) => !allowedFields.includes(key),
    );

    if (invalidField)
      return res.status(400).json({
        message: `Cannot update field: ${invalidField}`,
      });

    const validStatuses = ["inbox", "todo", "in_progress", "done"];
    const validPriorities = ["low", "normal", "high", "urgent"];

    if (!updates || typeof updates !== "object" || Array.isArray(updates))
      return res.status(400).json({ message: "Invalid request body" });

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "Cannot edit nothing" });

    if (updates.status !== undefined && !validStatuses.includes(updates.status))
      return res.status(400).json({ message: "Invalid status" });

    if (
      updates.priority !== undefined &&
      !validPriorities.includes(updates.priority)
    )
      return res.status(400).json({ message: "Invalid priority" });

    const task = await updateTask(task_id, req.session.user.id, updates);

    if (!task) return res.status(404).json({ message: "Task doesn't exist" });

    return res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (err) {
    console.error("Error while updating task:", err);

    return res.status(500).json({
      message: "Updating task failed",
    });
  }
}

async function deleteExistingTask(req, res) {
  try {
    const task_id = req.params.id;

    const result = await deleteTask(task_id, req.session.user.id);

    if (!result) return res.status(404).json({ message: "Task doesn't exist" });

    res.status(200).json({ message: "Task deleted", task: result });
  } catch (err) {
    console.log("Failed deleting task", err);

    res.status(500).json({ message: "Failed deleting task" });
  }
}

module.exports = {
  getAllTasks,
  getOneTask,
  createNewTask,
  updateExistingTask,
  deleteExistingTask,
};
