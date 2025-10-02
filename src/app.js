import express from 'express';
import cors from 'cors';
import path from 'path';
import notesRouter from './routes/notes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'))

// Routes
app.use('/notes', notesRouter);

// MAain route
app.get('/', (req, res) => {
    // ESM modules
    return res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

export default app;