## This is an experimental study repo. 

![ProjectView](https://imgur.com/a/uXJAMhQ)

## Endpoints (RESTful)
- GET  /notes          — list notes
- GET  /notes/:id      — get notes by id
- POST /notes          — create note (body: { content })
- PUT  /notes/:id      — update a note (body: { content, complete })
- DELETE /notes/:id    — delete a note
- GET  /notes/info     — get stats (total, complete)

### Modules
- notesModel.js → array and basic functions (create, list, delete).
- notesController.js  → handle req/res and call model functions.
- notes.js (route) → connect Express routes to controllers.
- server.js → just set up the app, apply middlewares and import routes.
> This part is the most complicated for me 

## Commands (frontend)
- note list                             — show all notes
- note show <id>                        — show note by id
- note <content>                        — create new note
- note edit <id> <content> [--c|--uc]   — update note content or or change status
- note remove <id> [--a]                — remove a note by id or all notes with "--a"
- note info                             — show stats (total, complete)
- clear                                 — clear screen