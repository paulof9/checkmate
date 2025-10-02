## This is an experimental and study repo. 

## Endpoints (RESTful)
- GET  /notes          — list notes
- GET  /notes/:id      — get notes
- POST /notes          — create note (body: { content })
- PUT  /notes/:id      — update note (body: { content, complete })
- DELETE /notes/:id    — delete note
- GET  /notes/info     — stats (total, complete)

## Commands (frontend)
- note list                             — show all notes
- note show <id>                        — show notes by id
- note <content>                        — create new note
- note edit <id> <content> [--c|--uc]   — updates content or if is completed
- note remove <id> [--a]                — removes note by id or all notes (--a)
- note info                             — show stats (total, complete)
- clear                                 — clean screen

## Roadmap atm:
- [ ] API
  - [x] CRUD ROUTES
  - [X] add res.status codes
  - [ ] Refactor
  - [ ] be modular
- [ ] FRONTEND
  - [x] add all commands
  - [ ] implement history message nav with key arrows
  - [ ] be modular
  - [ ] Be elegant
- [ ] BASH
  - [ ] SSH link
  - [ ] be an real CLI

- [ ] then migrate to React