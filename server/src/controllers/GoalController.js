const {
  createGoal,
  updateGoal,
  getGoals,
  getOneGoal: getGoalById,
  deleteGoal,
} = require("../models/GoalModel");
const createError = require("../utils/createError");

const validStatuses = [
  "not_started",
  "active",
  "on_hold",
  "achieved",
  "abandoned",
];

async function createNewGoal(req, res) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      createError("Invalid request body", 400);

    const { title, description, reason, status, start_date, target_date } =
      req.body;

    if (typeof title !== "string" || !title.trim())
      createError("Goal title required", 400);

    if (status !== undefined && !validStatuses.includes(status))
      createError("Invalid status", 400);

    const result = await createGoal([
      req.session.user.id,
      title.trim(),
      description,
      reason,
      status,
      start_date,
      target_date,
    ]);

    return res.status(201).json({
      message: "Goal created successfully",
      data: result,
    });
  } catch (err) {
    console.error("Creating goal failed:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

async function updateExistingGoal(req, res) {
  try {
    const goal_id = req.params.id;
    const updates = req.body;

    if (!updates || typeof updates !== "object" || Array.isArray(updates))
      createError("Invalid request body", 400);

    if (Object.keys(updates).length === 0)
      createError("Cannot edit nothing", 400);

    const allowedFields = [
      "title",
      "description",
      "status",
      "reason",
      "start_date",
      "target_date",
    ];

    const invalidField = Object.keys(updates).find(
      (key) => !allowedFields.includes(key),
    );

    if (invalidField) createError(`Cannot update field: ${invalidField}`, 400);

    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || !updates.title.trim())
    )
      createError("Invalid goal title", 400);

    if (updates.status !== undefined && !validStatuses.includes(updates.status))
      createError("Invalid status", 400);

    if (updates.title !== undefined) updates.title = updates.title.trim();

    const goal = await updateGoal(goal_id, req.session.user.id, updates);

    if (!goal) createError("Goal doesn't exist", 404);

    return res.status(200).json({
      message: "Goal updated successfully",
      data: goal,
    });
  } catch (err) {
    console.error("Updating goal failed:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

async function getAllGoals(req, res) {
  try {
    const result = await getGoals(req.session.user.id);

    if (result === undefined) createError("No goal exist", 404);

    return res.status(200).json({
      message: "Goals retrieved",
      data: result,
    });
  } catch (err) {
    console.error("Failed retrieving goals:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

async function getOneGoal(req, res) {
  try {
    const goal_id = req.params.id;

    const result = await getGoalById(goal_id, req.session.user.id);

    if (!result) createError("No goal found", 404);

    return res.status(200).json({
      message: "Goal retrieved",
      data: result,
    });
  } catch (err) {
    console.error("Failed retrieving goal:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

async function deleteExistingGoal(req, res) {
  try {
    const goal_id = req.params.id;

    const result = await deleteGoal(goal_id, req.session.user.id);

    if (!result) createError("Goal doesn't exist", 404);

    return res.status(200).json({
      message: "Goal deleted",
      data: result,
    });
  } catch (err) {
    console.error("Failed deleting goal:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

module.exports = {
  createNewGoal,
  updateExistingGoal,
  deleteExistingGoal,
  getAllGoals,
  getOneGoal,
};
