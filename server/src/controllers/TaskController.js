const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../models/TaskModel");
const createError = require("../utils/createError");

async function getAllTasks(req, res) {
  try {
    const result = await getTasks(req.session.user.id);

    if (!result) createError("No task found", 404);

    return res.status(200).json({ message: "Tasks retrieved", data: result });
  } catch (err) {
    console.error("Failed retrieving task:", err);

    return res.status(err.statusCode || 500).json({ message: err.message || "Internal server error" });
  }
}

async function getOneTask(req, res) {
  try {
    const task_id = req.params.id;

    const result = await getTaskById(task_id, req.session.user.id);

    if (!result) createError("No task found", 404)

    return res.status(200).json({ message: "Task retrieved", data: result });
  } catch (err) {
    console.error("Failed retrieving tasks:", err);

    return res.status(err.statusCode || 500).json({ message: err.message || "Internal server error" });
  }
}

async function createNewTask(req, res) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      createError("Invalid request body", 400)

    const { title, description, status, priority, due_date, scheduled_date } =
      req.body;

    const validStatuses = ["inbox", "todo", "in_progress", "done"];
    const validPriorities = ["low", "normal", "high", "urgent"];

    if (!title || typeof title !== "string" || !title.trim())
      createError("Title required", 400)

    if (status !== undefined && !validStatuses.includes(status))
      createError("Invalid status", 400)

    if (priority !== undefined && !validPriorities.includes(priority))
      createError("Invalid priority", 400)


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
      data: result,
    });
  } catch (err) {
    console.error("Creating task failed:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

async function updateExistingTask(req, res) {
  try {
    const task_id = req.params.id;
    const updates = req.body;

    if (!updates || typeof updates !== "object" || Array.isArray(updates))
      createError("Invalid request body", 400)

    if (Object.keys(updates).length === 0)
      createError("Cannot edit nothing", 400)

    const allowedFields = ["due_date", "scheduled_date", "priority", "status"];

    const invalidField = Object.keys(updates).find(
      (key) => !allowedFields.includes(key),
    );

    if (invalidField)
      createError(`Cannot update field: ${invalidField}`, 400)

    const validStatuses = ["inbox", "todo", "in_progress", "done"];
    const validPriorities = ["low", "normal", "high", "urgent"];

    if (!updates || typeof updates !== "object" || Array.isArray(updates))
      createError("Invalid request body", 400)

    if (Object.keys(updates).length === 0)
      createError("Invalid request body", 400)

    if (updates.status !== undefined && !validStatuses.includes(updates.status))
      createError("Invalid status", 400)


    if (
      updates.priority !== undefined &&
      !validPriorities.includes(updates.priority)
    )
      createError("Invalid priority", 400)

    const task = await updateTask(task_id, req.session.user.id, updates);

    if(!task) createError("Task doesn't exist", 404)

    return res.status(200).json({
      message: "Task updated successfully",
      data: task,
    });
  } catch (err) {
    console.error("Error while updating task:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

async function deleteExistingTask(req, res) {
  try {
    const task_id = req.params.id;

    const result = await deleteTask(task_id, req.session.user.id);

    if (!result) createError("Task doesn't exist", 404)

    res.status(200).json({ message: "Task deleted", data: result });
  } catch (err) {
    console.log("Failed deleting task", err);

    res.status(err.statusCode || 500).json({ message: err.message || "Internal server error" });
  }
}

module.exports = {
  getAllTasks,
  getOneTask,
  createNewTask,
  updateExistingTask,
  deleteExistingTask,
};
