const {
  createProj,
  getProj,
  getOneProj,
  updateProj,
  deleteProj,
} = require("../models/ProjModel");

async function getAllProjects(req, res) {
  try {
    const result = await getProj(req.session.user.id);

    return res.status(200).json({
      message: "Projects retrieved",
      data: result,
    });
  } catch (err) {
    console.error("Failed retrieving projects:", err);

    return res.status(500).json({
      message: "Failed retrieving projects",
    });
  }
}

async function getOneProject(req, res) {
  try {
    const proj_id = req.params.id;

    const result = await getOneProj(proj_id, req.session.user.id);

    if (!result) return res.status(404).json({ message: "No project found" });

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
      return res.status(400).json({ message: "Invalid request body" });

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
      return res.status(400).json({ message: "Project name required" });

    if (status !== undefined && !validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    if (priority !== undefined && !validPriorities.includes(priority))
      return res.status(400).json({ message: "Invalid priority" });

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

    return res.status(500).json({
      message: "Creating project failed",
    });
  }
}

async function updateExistingProject(req, res) {
  try {
    const proj_id = req.params.id;
    const updates = req.body;

    if (!updates || typeof updates !== "object" || Array.isArray(updates))
      return res.status(400).json({ message: "Invalid request body" });

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "Cannot edit nothing" });

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

    if (invalidField)
      return res.status(400).json({
        message: `Cannot update field: ${invalidField}`,
      });

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
      return res.status(400).json({ message: "Invalid project name" });

    if (updates.status !== undefined && !validStatuses.includes(updates.status))
      return res.status(400).json({ message: "Invalid status" });

    if (
      updates.priority !== undefined &&
      !validPriorities.includes(updates.priority)
    )
      return res.status(400).json({ message: "Invalid priority" });

    if (updates.name !== undefined) updates.name = updates.name.trim();

    const project = await updateProj(proj_id, req.session.user.id, updates);

    if (!project)
      return res.status(404).json({ message: "Project doesn't exist" });

    return res.status(200).json({
      message: "Project updated successfully",
      data: project,
    });
  } catch (err) {
    console.error("Error while updating project:", err);

    return res.status(500).json({
      message: "Updating project failed",
    });
  }
}

async function deleteExistingProject(req, res) {
  try {
    const proj_id = req.params.id;

    const result = await deleteProj(proj_id, req.session.user.id);

    if (!result)
      return res.status(404).json({ message: "Project doesn't exist" });

    return res.status(200).json({
      message: "Project deleted",
      data: result,
    });
  } catch (err) {
    console.error("Failed deleting project:", err);

    return res.status(500).json({
      message: "Failed deleting project",
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