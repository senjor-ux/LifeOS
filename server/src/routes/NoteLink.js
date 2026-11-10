const express = require("express");
const requireAuth = require("../middleware/Auth");
const {
  createNoteLink,
  getLinkedNotes,
  deleteNoteLink,
} = require("../controllers/NoteLinkController");

const router = express.Router();

// Tasks
router.get("/tasks/:task_id/notes", requireAuth, (req, res) =>
  getLinkedNotes(req, res, "task"),
);
router.post("/notes/:note_id/tasks/:task_id", requireAuth, (req, res) =>
  createNoteLink(req, res, "task"),
);
router.delete("/notes/:note_id/tasks/:task_id", requireAuth, (req, res) =>
  deleteNoteLink(req, res, "task"),
);

// Projects
router.get("/projects/:project_id/notes", requireAuth, (req, res) =>
  getLinkedNotes(req, res, "project"),
);
router.post("/notes/:note_id/projects/:project_id", requireAuth, (req, res) =>
  createNoteLink(req, res, "project"),
);
router.delete("/notes/:note_id/projects/:task_id", requireAuth, (req, res) =>
  deleteNoteLink(req, res, "project"),
);

// Goals
router.get("/goals/:goal_id/notes", requireAuth, (req, res) =>
  getLinkedNotes(req, res, "goal"),
);
router.post("/notes/:note_id/goal/:goal_id", requireAuth, (req, res) =>
  createNoteLink(req, res, "goal"),
);
router.delete("/notes/:note_id/goals/:task_id", requireAuth, (req, res) =>
  deleteNoteLink(req, res, "goal"),
);

module.exports = router;
