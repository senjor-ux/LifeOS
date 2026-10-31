const express = require("express");
const requireAuth = require("../middleware/Auth");
const {
  getAllTasks,
  getOneTask,
  createNewTask,
  updateExistingTask,
  deleteExistingTask,
} = require("../controllers/TaskController");

const router = express.Router();

router.post("/", requireAuth, createNewTask);
router.get("/", requireAuth, getAllTasks);
router.get("/:id", requireAuth, getOneTask);
router.patch("/:id", requireAuth, updateExistingTask);
router.delete("/:id", requireAuth, deleteExistingTask);

module.exports = router;
