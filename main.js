import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'))

// middleware to interpret express JSON
app.use(express.json());

// In-memory data store (not for production use)
let notes = [
  { id: 1, content: 'First note', complete: '1' },
  { id: 2, content: 'Second note', complete: '0' }
];

// DELETE ALL NOTES
app.delete('/notes', (req, res) => {
  notes = [];
  console.log('All notes deleted.');
  return res.status(204).end(); // No Content
});

//DELETE BY ID
app.delete('/notes/:id', (req, res) => {
    const id = Number(req.params.id);
    const beforeLength = notes.length;
    notes = notes.filter(note => note.id !== id); // filter to remove the note, all other notes remain except the requested one
    // verify if note has been deleted by the total of notes
    if (notes.length === beforeLength) {
        return res.status(404).json({ error: 'Not found' });
    }
    console.log(`Note with id ${id} deleted.`);
    return res.status(204).end();
});

//UPDATE
app.put("/notes/:id", (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) return res.status(404).json({ error: "Note not found" });
    notes[noteIndex] = { ...notes[noteIndex], ...req.body} // spread operator (...) to update only the fields sent in the request body
    console.log('Note updated:', notes[noteIndex]);
    return res.json(notes[noteIndex]);
});

//CREATE
app.post('/notes', (req, res) => {
    if (!req.body.content || req.body.content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });  
    };
    const nextId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) +1 : 1; //map to rewrite
    const newNote = { id: nextId, ...req.body, complete: '0' }; // new notes are incomplete by default
    notes.push(newNote);
    console.log('New note added:', newNote);
    // only res.status(201).json(newNote) will work too, but location is a good practice!
    return res.status(201).location(`/notes/${newNote.id}`).json(newNote);
});

//READ INFO
app.get('/notes/info', (req, res) => {
    const totalNotes = notes.length;
    const completeNotes = notes.filter(note => note.complete === '1'); // note is the index 'i'
    return res.status(200).json({ total: totalNotes, complete: completeNotes.length });
});

//READ ALL
app.get('/notes', (req, res) => {
    return res.status(200).json(notes);
});

//READ ONE
app.get('/notes/:id', (req, res) => {
    const id = Number(req.params.id);
    const note = notes.find(note => note.id === id);
    // lets use find cause /notes/1 should return one object, not an array
    if (note){
        return res.status(200).json(note); // '0' cause filter returns an array
    }else{
        return res.status(404).json({ error: 'Not found' });
    }
});

// MAIN PAGE ROUTE
app.get('/', (req, res) => {
    // this one is adapted to ESM modules i searched
    return res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  //res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});