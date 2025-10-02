// Nothing of (req res) here, just data manipulation

let notes = [
  { id: 1, content: 'First note', complete: '1' },
  { id: 2, content: 'Second note', complete: '0' }
];

export function getAllNotes(){
  return notes;
}

export function getNoteById(id){
  return notes.find(note => note.id === id)
}

export function getInfo(){
  return{
    total: notes.length,
    complete: notes.filter(note => note.complete === '1').length
  }
};

export function create(note){
  notes.push(note);
  return note;
};

export function update(id, data){
  const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) return null;
    notes[noteIndex] = { ...notes[noteIndex], ...data}
    return notes[noteIndex];
}

export function removeNoteById(id){
  const beforeLength = notes.length;
  notes = notes.filter(note => note.id !== id);
  return notes.length < beforeLength; // true if removed
};

export function removeAllNotes(){
  return notes = [];
};