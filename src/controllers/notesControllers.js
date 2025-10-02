import * as model from '../models/notesModel.js';

export function list(req, res) {
    const notes = model.getAllNotes();
    return res.status(200).json(notes);
};

export function info(req, res) {
  return res.status(200).json(model.getInfo());
};

export function getById(req, res) {
  const note = model.getNoteById(Number(req.params.id));
  if (note) {
    return res.status(200).json(note);
  } else {
    return res.status(404).json({ error: 'Not found' });
  }
};

export function create(req, res) {
  const { content } = req.body;
  if (!content || content.trim() === '') return res.status(400).json({ error: 'Content is required' });  
   
    const notes = model.getAllNotes();
    const nextId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) +1 : 1; // .map to rewrite
    const newNote = { id: nextId, content, complete: '0' };

    // Specifies the location of the newly created resource
    return res.status(201).location(`/notes/${newNote.id}`).json(model.create(newNote));
};

export function update(req, res) {
  const id = Number(req.params.id);
  const updated = model.update(id, req.body)
  if (!updated) return res.status(404).json({ error: 'Not found' });
  return res.json(updated);
};

export function remove(req, res) {
  const id = Number(req.params.id);
  const removed = model.removeNoteById(id);
  if (!removed) return res.status(404).json({ error: 'Not found' });
  return res.status(204).end();
};

export function removeAll(req, res) {
  model.removeAllNotes();
  return res.status(204).end();
};