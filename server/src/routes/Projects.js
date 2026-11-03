const express = require("express");
const requireAuth = require("../middleware/Auth");
const {
  getAllProjects,
  getOneProject,
  createNewProject,
  updateExistingProject,
  deleteExistingProject,
} = require("../controllers/ProjController");

const router = express.Router();

router.post("/", requireAuth, createNewProject);
router.get("/", requireAuth, getAllProjects);
router.get("/:id", requireAuth, getOneProject);
router.patch("/:id", requireAuth, updateExistingProject);
router.delete("/:id", requireAuth, deleteExistingProject);

module.exports = router
