const {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} = require("../models/NotesModel");

async function createOneNote(req, res) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      return res.status(400).json({ message: "Invalid request body" });

    const { title, content } = req.body;

    if (!title || !title.trim() || typeof title !== "String")
      return res.status(400).json({ message: "Fill in title" });

    const result = await createNote([title.trim(), content]);

    return res.status(201).json({ message: "Note created", data: result });
  } catch (err) {
    console.log("Error creating note");

    res.status(500).json({ message: "Error creating note" });
  }
}

async function getAllNotes(req, res) {
  try {
    const result = await getNotes(req.session.user.id);

    return res.status(201).json({ message: "Notes retrieved", data: result });
  } catch (err) {
    console.log("error retrieving notes", err);

    return res.status(500).json({ message: "Error getting notes" });
  }
}

async function getOneNote(req, res) {
  try {
    const result = await getNote(req.session.user.id);

    return res.status(201).json({ message: "Note retrieved", data: result });
  } catch (err) {
    console.log("error retrieving note", err);

    return res.status(500).json({ message: "Error getting note" });
  }
}

async function updateExistingNote(req, res) {
  try {
    const note_id = req.params.id;
    const updates = req.body;

    if (!updates || typeof updates !== "object" || Array.isArray(updates))
      return res.status(400).json({ message: "Invalid request body" });

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "Cannot edit nothing" });

    const allowedFields = ["name", "content"];

    const invalidField = Object.keys(updates).find(
      (key) => !allowedFields.includes(key),
    );

    if (invalidField)
      return res.status(400).json({
        message: `Cannot update field: ${invalidField}`,
      });

    if (note.title !== undefined) note.title = note.title.trim();

    const note = await updateExistingNote(
      note_id,
      req.session.user.id,
      updates,
    );

    if (!note) return res.status(404).json({ message: "Note doesn't exist" });

    return res.status(200).json({
      message: "Note updated successfully",
      data: note,
    });
  } catch (err) {
    console.error("Error while updating note:", err);

    return res.status(500).json({
      message: "Updating note failed",
    });
  }
}

async function deleteExistingNote(req, res) {
  try {
    const note_id = req.params.id;

    const result = await deleteNote(note_id, req.session.user.id);

    if (!result) return res.status(404).json({ message: "Note doesn't exist" });

    return res.status(200).json({
      message: "Note deleted",
      data: result,
    });
  } catch (err) {
    console.error("Failed deleting note:", err);

    return res.status(500).json({
      message: "Failed deleting note",
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
