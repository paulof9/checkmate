import express from 'express';
const app = express();
const PORT = 3000;

// middleware para express interpretar JSON
app.use(express.json());

let notes = [
  { id: 1, content: 'First note', complete: '1' },
  { id: 2, content: 'Second note', complete: '0' }
];

app.delete('/notes/:id', (req, res) => {
    const id = Number(req.params.id);
    notes = notes.filter(note => note.id !== id);
    console.log(`Note with id ${id} deleted.`);

});

app.put("/notes/:id", (req, res) => {
    const id = Number(req.params.id);
    const noteIndex = notes.findIndex(note => note.id === id);
    notes[noteIndex] = { ...notes[noteIndex], ...req.body} // spread operator (...) to update only the fields sent in the request body
    console.log('Note updated:', notes[noteIndex]);
});

app.post('/notes', (req, res) => {
    const newNote = {
        id: notes.length + 1,
        ...req.body,
        complete: '0'
    };
    notes.push(newNote);
    res.json({ content: newNote });
    console.log('New note added:', newNote);
});

app.get('/notes/info', (req, res) => {
    const totalNotes = notes.length;
    const completeNotes = notes.filter(note => note.complete === '1'); // note is the index 'i'
    res.json({ total: totalNotes, complete: completeNotes.length });
});

app.get('/notes/list', (req, res) => {
    res.json(notes);
});

app.get('/notes/:id', (req, res) => {
    const id = Number(req.params.id);
    const note = notes.filter(note => note.id === id);
    if (note.length > 0){
        res.json(note[0]); // '0' cause filter returns an array
    }else{
        res.status(404).end();
    }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});