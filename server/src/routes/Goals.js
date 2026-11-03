const express = require("express");
const requireAuth = require("../middleware/Auth");
const {
  createNewGoal,
  updateExistingGoal,
  deleteExistingGoal,
  getAllGoals,
  getOneGoal,
} = require("../controllers/GoalController");

const router = express.Router();

router.post("/", requireAuth, createNewGoal);
router.get("/", requireAuth, getAllGoals);
router.get("/:id", requireAuth, getOneGoal);
router.patch("/:id", requireAuth, updateExistingGoal);
router.delete("/:id", requireAuth, deleteExistingGoal);

module.exports = router;
