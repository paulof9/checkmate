// this front() calls the showNotes() function when the user presses Enter in the input field or submits the form
export default function front() {
    const input = document.getElementById('input');
    const form = document.getElementById('form');
    
    // CLEAR
    function clearRes() {
        const resDiv = document.getElementById('resDiv');
        resDiv.innerHTML = '';
    }

    // MSG ERROR
    function showError(message){
        const resDiv = document.getElementById('resDiv');
        const p = document.createElement('p');
        p.textContent = `Error: ${message}`;
        p.style.color = '#ff2626ff';
        resDiv.appendChild(p);
    }

    // COMMANDS
    input.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const cmd = input.value.trim().toLowerCase();
            const raw = input.value.trim();
            input.value = '';
            input.focus();

            if(cmd === "note list"){
                showNotes();

            }else if(cmd === "clear"){
                clearRes();
            }else if(cmd === "note info"){
                showInfo();

            }else if(cmd.startsWith("note show ")){
                const id = cmd.split(" ")[2];
                if(!Number.isNaN(Number(id))){
                    showNoteById(id);
                }else{
                    showError('Invalid ID.');
                }

            }else if(cmd.startsWith("note edit ")){
                // parse: note edit <id> <new content> [--c to mark as complete]
                const parts = raw.split(" "); // ["note", "edit", "<id>", "<new content>", "[--c]"]
                const id = parts[2]; // get the position, in this case <id>
                if(Number.isNaN(Number(id))){
                    showError('Invalid ID.');
                    return;
                }

                // all parts after the id as new content
                let content = parts.slice(3).join(" ").trim(); // join all parts after the id as new content
                if (!content) {
                        showError('Usage: note edit <id> <new content> [--c to mark as complete/--uc to mark as uncomplete]');
                        return;
                    }

                // check for --c or --uc flags at the end of the content
                let complete;
                const m = content.match(/(.*?)\s*--c\s*$/i);
                if (m) { content = m[1].trim(); complete = 1; }

                const unm = content.match(/(.*?)\s*--uc\s*$/i);
                if (unm) { content = unm[1].trim(); complete = 0; }

                showUpdate(id, content, complete);
                return;
            
            }else if(cmd.startsWith("note remove ")){
                const arg = raw.split(" ")[2];
                if (arg === '--a') {
                    deleteAllNotes();
                } else if (!Number.isNaN(Number(arg))) {
                    deleteNote(arg);
                } else {
                    showError('Usage: note remove <id> or note remove --a to delete all notes');
                }
            }else if(cmd.startsWith("note ")){
                    const content = raw.substring(5).trim(); // get everything after "note "
                    if(!content){
                        showError('Usage: note <content>');
                        return;
                    }else{
                        newNote(content);
                    }
            
            }else{
                showError('Invalid command.');
            }
        }
    });
}

// SHOW ALL NOTES
async function showNotes() {
    const resDiv = document.getElementById('resDiv');
    try {
        const res = await fetch('/notes');
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err && err.error ? err.error : `Server returned ${res.status}`);
        }
        const notes = await res.json();
        console.log(notes);

        notes.forEach(n => {
            const complete = (n.complete === 0 || n.complete === '0') ? 'n' : 'y';
            const p = document.createElement('p');
            p.textContent = `[${n.id}]: ${n.content} (complete: ${complete})`;
            resDiv.appendChild(p);
        });
    } catch (err) {
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.style.color = '#ff2626ff';
        resDiv.appendChild(p);
        console.error(err);
    }
}

// SHOW INFO (total and completed notes)
async function showInfo(){
    const resDiv = document.getElementById('resDiv');
    try {
        const res = await fetch('/notes/info');
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err && err.error ? err.error : `Server returned ${res.status}`);
        }
        const info = await res.json();
        console.log(info);

        const p = document.createElement('p');
        p.textContent = `Total: ${info.total}, Complete: ${info.complete}`;
        resDiv.appendChild(p);
    }catch(err){
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.style.color = '#ff2626ff';
        resDiv.appendChild(p);
        console.error(err);
    };
};

// SHOW NOTE BY ID
async function showNoteById(id) {
    const resDiv = document.getElementById('resDiv');
    try{
        const res = await fetch(`/notes/${id}`);
        if (!res.ok) {
            if (res.status === 404) {
                const p = document.createElement('p');
                p.textContent = 'Not found.';
                p.style.color = '#ff2626ff';
                resDiv.appendChild(p);
                return;
            }
            const err = await res.json().catch(() => null);
            throw new Error(err && err.error ? err.error : `Server returned ${res.status}`);
        }
        const noteId = await res.json();
        console.log(noteId);

        const complete = (noteId.complete === 0 || noteId.complete === '0') ? 'n' : 'y';
        const p = document.createElement('p');
        p.textContent = `[${noteId.id}]: ${noteId.content} (complete: ${complete})`;
        resDiv.appendChild(p);
    }catch(err){
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.style.color = '#ff2626ff';
        resDiv.appendChild(p);
        console.error(err);
    }
};

// SHOW UPDATE
async function showUpdate(id, newContent, complete){
    const resDiv = document.getElementById('resDiv');
    try{
        const res = await fetch(`/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newContent, complete })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            resDiv.innerHTML = '';
            const p = document.createElement('p');
            p.textContent = err && err.error ? err.error : `Failed (status ${res.status})`;
            p.style.color = '#ff2626ff';
            resDiv.appendChild(p);
            return;
        }

        const updatedNote = await res.json();
        const p = document.createElement('p');
        const completeFlag = String(updatedNote.complete) === '1' ? 'y' : 'n';
        p.textContent = `Note updated: [${updatedNote.id}]: ${updatedNote.content} (complete: ${completeFlag})`;
        resDiv.appendChild(p);
    }catch(err){
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.style.color = '#ff2626ff';
        resDiv.appendChild(p);
        console.error(err);
    }
};

// DELETE NOTE
async function deleteNote(id){
    const resDiv = document.getElementById('resDiv');
    try{
        const res = await fetch(`/notes/${id}`, { method: 'DELETE' });
        if(res.status === 204){
            const p = document.createElement('p');
            p.textContent = `Note ${id} deleted.`;
            resDiv.appendChild(p);
            return;
        }
        // non-204: try to read error body
        const err = await res.json().catch(() => null);
        resDiv.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = err && err.error ? err.error : `Failed to delete (status ${res.status})`;
        p.style.color = '#ff2626ff';
        resDiv.appendChild(p);
    }catch(err){
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.style.color = '#ff2626ff';
        resDiv.appendChild(p);
        console.error(err);
    }
}

// DELETE ALL NOTES
async function deleteAllNotes() {
    const resDiv = document.getElementById('resDiv');
    try {
        const res = await fetch('/notes', { method: 'DELETE' });
        if (res.status === 204) {
            const p = document.createElement('p');
            p.textContent = 'All notes deleted.';
            resDiv.appendChild(p);
            return;
        }
        const err = await res.json().catch(() => null);
        resDiv.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = err && err.error ? err.error : `Failed to delete all (status ${res.status})`;
        p.style.color = '#ff2626ff';
        resDiv.appendChild(p);
    } catch (err) {
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.style.color = '#ff2626ff';
        resDiv.appendChild(p);
        console.error(err);
    }
}

// NEW NOTE
async function newNote(content){
    const resDiv = document.getElementById('resDiv');
    try{
        // specify method, headers and body to send JSON data correctly
        const res = await fetch('/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content })
        });
        if (!res.ok && res.status !== 201) {
            const err = await res.json().catch(() => null);
            resDiv.innerHTML = '';
            const p = document.createElement('p');
            p.textContent = err && err.error ? err.error : `Failed (status ${res.status})`;
            p.style.color = '#ff2626ff';
            resDiv.appendChild(p);
            return;
        }
        const addedNote = await res.json();
        const p = document.createElement('p');
        p.textContent = `New note added: [${addedNote.id}]: ${addedNote.content} (complete: ${addedNote.complete === '1' ? 'y' : 'n'})`;
        resDiv.appendChild(p);
    }catch(err){
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.style.color = '#ff2626ff';
        resDiv.appendChild(p);
        console.error(err);
    }
}

front();
