const {
  createGoal,
  updateGoal,
  getGoals,
  getOneGoal: getGoalById,
  deleteGoal,
} = require("../models/GoalModel");

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
      return res.status(400).json({ message: "Invalid request body" });

    const { title, description, reason, status, start_date, target_date } =
      req.body;

    if (typeof title !== "string" || !title.trim())
      return res.status(400).json({ message: "Goal title required" });

    if (status !== undefined && !validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status" });

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

    return res.status(500).json({
      message: "Creating goal failed",
    });
  }
}

async function updateExistingGoal(req, res) {
  try {
    const goal_id = req.params.id;
    const updates = req.body;

    if (!updates || typeof updates !== "object" || Array.isArray(updates))
      return res.status(400).json({ message: "Invalid request body" });

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "Cannot edit nothing" });

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

    if (invalidField)
      return res.status(400).json({
        message: `Cannot update field: ${invalidField}`,
      });

    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || !updates.title.trim())
    )
      return res.status(400).json({ message: "Invalid goal title" });

    if (updates.status !== undefined && !validStatuses.includes(updates.status))
      return res.status(400).json({ message: "Invalid status" });

    if (updates.title !== undefined) updates.title = updates.title.trim();

    const goal = await updateGoal(goal_id, req.session.user.id, updates);

    if (!goal) return res.status(404).json({ message: "Goal doesn't exist" });

    return res.status(200).json({
      message: "Goal updated successfully",
      data: goal,
    });
  } catch (err) {
    console.error("Updating goal failed:", err);

    return res.status(500).json({
      message: "Updating goal failed",
    });
  }
}

async function getAllGoals(req, res) {
  try {
    const result = await getGoals(req.session.user.id);

    return res.status(200).json({
      message: "Goals retrieved",
      data: result,
    });
  } catch (err) {
    console.error("Failed retrieving goals:", err);

    return res.status(500).json({
      message: "Failed retrieving goals",
    });
  }
}

async function getOneGoal(req, res) {
  try {
    const goal_id = req.params.id;

    const result = await getGoalById(goal_id, req.session.user.id);

    if (!result) return res.status(404).json({ message: "No goal found" });

    return res.status(200).json({
      message: "Goal retrieved",
      data: result,
    });
  } catch (err) {
    console.error("Failed retrieving goal:", err);

    return res.status(500).json({
      message: "Failed retrieving goal",
    });
  }
}

async function deleteExistingGoal(req, res) {
  try {
    const goal_id = req.params.id;

    const result = await deleteGoal(goal_id, req.session.user.id);

    if (!result) return res.status(404).json({ message: "Goal doesn't exist" });

    return res.status(200).json({
      message: "Goal deleted",
      data: result,
    });
  } catch (err) {
    console.error("Failed deleting goal:", err);

    return res.status(500).json({
      message: "Failed deleting goal",
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
