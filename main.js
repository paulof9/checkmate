import express from 'express';
const app = express();
const PORT = 3000;

// middleware para express interpretar JSON
app.use(express.json());

let notes = [
  { id: 1, content: 'First note', complete: '1' },
  { id: 2, content: 'Second note', complete: '0' }
];

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

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});