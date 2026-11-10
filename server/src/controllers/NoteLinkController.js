const { createLink, getLink, deleteLink } = require("../models/NoteLinkModel");

async function createNoteLink(req, res, object) {
  try {
    const object_id = req.params[`${object}_id`];
    const note_id = req.params.note_id;

    const result = await createLink(
      object,
      note_id,
      object_id,
      req.session.user.id,
    );

    return res.status(201).json({ message: "Created link", data: result });
  } catch (err) {
    console.log("Failed to create link", err);

    return res.status(500).json({ message: "Failed to create link" });
  }
}

async function getLinkedNotes(req, res, object) {
  try {
    const object_id = req.params[`${object}_id`];

    const result = await getLink(object, object_id, req.session.user.id);

    return res.status(200).json({ message: "links retrieved", data: result });
  } catch (err) {
    console.log("Failed to create link", err);

    return res.status(500).json({ message: "Failed to create link" });
  }
}

async function deleteNoteLink(req, res, object) {
  try {
    const object_id = req.params[`${object}_id`];
    const note_id = req.params.note_id

    const result = await deleteLink(object, object_id, note_id, req.session.user.id);

    return res.status(200).json({ message: "links retrieved", data: result });
  } catch (err) {
    console.log("Failed to delete link", err);

    return res.status(500).json({ message: "Failed to deletelink" });
  }
}

module.exports = { createNoteLink, getLinkedNotes, deleteNoteLink };
