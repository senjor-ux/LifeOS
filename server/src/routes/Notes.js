const express = require("express");
const requireAuth = require("../middleware/Auth");
const {
  createOneNote,
  getAllNotes,
  getOneNote,
  updateExistingNote,
  deleteExistingNote,
} = require("../controllers/NotesController");

const router = express.Router();

router.get("/", requireAuth, getAllNotes);
router.post("/", requireAuth, createOneNote);
router.get("/:id", requireAuth, getOneNote);
router.patch("/:id", requireAuth, updateExistingNote);
router.delete("/:id", requireAuth, deleteExistingNote);

module.exports = router;
