const {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} = require("../models/NotesModel");
const createError = require("../utils/createError");

async function createOneNote(req, res) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      createError("Invalid request body", 400);

    const { title, content } = req.body;

    if (!title || !title.trim() || typeof title !== "string")
      createError("Fill in title", 400);

    const result = await createNote([
      req.session.user.id,
      title.trim(),
      content,
    ]);

    return res.status(201).json({ message: "Note created", data: result });
  } catch (err) {
    console.log("Error creating note", err);

    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Internal server error" });
  }
}

async function getAllNotes(req, res) {
  try {
    const result = await getNotes(req.session.user.id);

    if (result === undefined) createError("No note found", 404);

    return res.status(200).json({ message: "Notes retrieved", data: result });
  } catch (err) {
    console.log("error retrieving notes", err);

    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Internal server error" });
  }
}

async function getOneNote(req, res) {
  try {
    const result = await getNote(req.params.id, req.session.user.id);

    if (!result) createError("No note found", 404);

    return res.status(200).json({ message: "Note retrieved", data: result });
  } catch (err) {
    console.log("error retrieving note", err);

    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Internal server error" });
  }
}

async function updateExistingNote(req, res) {
  try {
    const note_id = req.params.id;
    const updates = req.body;

    if (!updates || typeof updates !== "object" || Array.isArray(updates))
      createError("Invalid request body", 400);

    if (Object.keys(updates).length === 0)
      createError("Cannot edit nothing", 400);

    const allowedFields = ["title", "content"];

    const invalidField = Object.keys(updates).find(
      (key) => !allowedFields.includes(key),
    );

    if (invalidField) createError(`Cannot update field: ${invalidField}`, 400);

    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || !updates.title.trim())
        createError("Invalid title", 400);

      updates.title = updates.title.trim();
    }

    const note = await updateNote(note_id, req.session.user.id, updates);

    if (!note) createError("Note doesn't exist", 404);

    return res.status(200).json({
      message: "Note updated successfully",
      data: note,
    });
  } catch (err) {
    console.error("Error while updating note:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

async function deleteExistingNote(req, res) {
  try {
    const note_id = req.params.id;

    const result = await deleteNote(note_id, req.session.user.id);

    if (!result) createError("Note doesn't exist", 404);

    return res.status(200).json({
      message: "Note deleted",
      data: result,
    });
  } catch (err) {
    console.error("Failed deleting note:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

module.exports = {
  createOneNote,
  getAllNotes,
  getOneNote,
  updateExistingNote,
  deleteExistingNote,
};
