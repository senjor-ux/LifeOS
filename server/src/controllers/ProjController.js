const {
  createProj,
  getProj,
  getOneProj,
  updateProj,
  deleteProj,
} = require("../models/ProjModel");
const createError = require("../utils/createError");

async function getAllProjects(req, res) {
  try {
    const result = await getProj(req.session.user.id);

    if (result === undefined) createError("No project found", 404);

    return res.status(200).json({
      message: "Projects retrieved",
      data: result,
    });
  } catch (err) {
    console.error("Failed retrieving projects:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

async function getOneProject(req, res) {
  try {
    const proj_id = req.params.id;

    const result = await getOneProj(proj_id, req.session.user.id);

    if (!result) createError("No project found", 404);

    return res.status(200).json({
      message: "Project retrieved",
      data: result,
    });
  } catch (err) {
    console.error("Failed retrieving project:", err);

    return res.status(500).json({
      message: "Failed retrieving project",
    });
  }
}

async function createNewProject(req, res) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      createError("Invalid request body", 400);

    const { name, description, status, priority, start_date, target_date } =
      req.body;

    const validStatuses = [
      "planning",
      "active",
      "on_hold",
      "completed",
      "archived",
    ];

    const validPriorities = ["low", "normal", "high", "urgent"];

    if (typeof name !== "string" || !name.trim())
      createError("Project name required", 400);

    if (status !== undefined && !validStatuses.includes(status))
      createError("Invalid status", 400);

    if (priority !== undefined && !validPriorities.includes(priority))
      createError("Invalid priority", 400);

    const result = await createProj([
      req.session.user.id,
      name.trim(),
      description,
      status,
      priority,
      start_date,
      target_date,
    ]);

    return res.status(201).json({
      message: "Project created successfully",
      data: result,
    });
  } catch (err) {
    console.error("Creating project failed:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

async function updateExistingProject(req, res) {
  try {
    const proj_id = req.params.id;
    const updates = req.body;

    if (!updates || typeof updates !== "object" || Array.isArray(updates))
      createError("Invalid request body", 400);

    if (Object.keys(updates).length === 0)
      createError("Cannot edit nothing", 400);

    const allowedFields = [
      "name",
      "description",
      "status",
      "priority",
      "start_date",
      "target_date",
    ];

    const invalidField = Object.keys(updates).find(
      (key) => !allowedFields.includes(key),
    );

    if (invalidField) createError(`Cannot update field: ${invalidField}`, 400);

    const validStatuses = [
      "planning",
      "active",
      "on_hold",
      "completed",
      "archived",
    ];

    const validPriorities = ["low", "normal", "high", "urgent"];

    if (
      updates.name !== undefined &&
      (typeof updates.name !== "string" || !updates.name.trim())
    )
      createError("Invalid project name", 400);

    if (updates.status !== undefined && !validStatuses.includes(updates.status))
      createError("Invalid status", 400);

    if (
      updates.priority !== undefined &&
      !validPriorities.includes(updates.priority)
    )
      createError("Invalid priority", 400);

    if (updates.name !== undefined) updates.name = updates.name.trim();

    const project = await updateProj(proj_id, req.session.user.id, updates);

    if (!project) createError("Project doens't exist", 404);

    return res.status(200).json({
      message: "Project updated successfully",
      data: project,
    });
  } catch (err) {
    console.error("Error while updating project:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

async function deleteExistingProject(req, res) {
  try {
    const proj_id = req.params.id;

    const result = await deleteProj(proj_id, req.session.user.id);

    if (!result) createError("Project doesn't exist", 404);

    return res.status(200).json({
      message: "Project deleted",
      data: result,
    });
  } catch (err) {
    console.error("Failed deleting project:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

module.exports = {
  getAllProjects,
  getOneProject,
  createNewProject,
  updateExistingProject,
  deleteExistingProject,
};
