// this front() creates a terminal-like interface with inline input
export default function front() {
    const resDiv = document.getElementById('resDiv');
    
    // command history
    let commandHistory = [];
    let historyIndex = -1;

    // get username and machine name (can be customized)
    const username = 'user';
    const machine = 'machine';
    const prompt = `${username}@${machine}:$`;

    // create initial prompt line with input
    createPromptLine();

    // CLEAR terminal
    function clearRes() {
        resDiv.innerHTML = '';
        createPromptLine();
    }

    // display error message
    function showError(message){
        const p = document.createElement('p');
        p.textContent = `Error: ${message}`;
        p.className = 'text-red-500 ml-2 my-1';
        resDiv.appendChild(p);
        scrollToBottom();
    }

    // scroll to bottom of terminal
    function scrollToBottom() {
        resDiv.scrollTo({
            top: resDiv.scrollHeight,
            behavior: 'smooth'
        });
    }

    // create a new prompt line with inline input
    function createPromptLine() {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'flex items-center mt-2';

        const promptSpan = document.createElement('span');
        promptSpan.textContent = prompt + ' ';
        promptSpan.className = 'text-green-500 font-bold whitespace-pre';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'flex-1 bg-transparent border-none outline-none text-white font-mono text-sm caret-green-500';

        lineDiv.appendChild(promptSpan);
        lineDiv.appendChild(input);
        resDiv.appendChild(lineDiv);

        input.focus();
        scrollToBottom();

        // handle keyboard input
        input.addEventListener('keydown', (e) => {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    input.value = commandHistory[commandHistory.length - 1 - historyIndex];
                }
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    input.value = commandHistory[commandHistory.length - 1 - historyIndex];
                } else if (historyIndex === 0) {
                    historyIndex = -1;
                    input.value = '';
                }
            } else if (e.key === "Enter") {
                e.preventDefault();
                handleCommand(input);
            }
        });
    }

    // handle command execution
    async function handleCommand(input) {
        const raw = input.value.trim();
        const cmd = raw.toLowerCase();
        
        if (!raw) {
            createPromptLine();
            return;
        }
        
        // add to history
        commandHistory.push(raw);
        historyIndex = -1;
        
        // disable the current input
        input.disabled = true;
        input.className += ' opacity-70';
        
        // execute command and wait for response
        await executeCommand(cmd, raw);
        
        // create new prompt line for next command
        createPromptLine();
    }

    // click anywhere in terminal to focus on current input
    resDiv.addEventListener('click', () => {
        const inputs = resDiv.querySelectorAll('input[type="text"]:not([disabled])');
        if (inputs.length > 0) {
            inputs[inputs.length - 1].focus();
        }
    });

    // execute command based on input
    async function executeCommand(cmd, raw) {
        if (cmd === "note list") {
            await showNotes();
        } else if (cmd === "clear") {
            clearRes();
        } else if (cmd === "note info") {
            await showInfo();
        } else if (cmd.startsWith("note show ")) {
            const id = cmd.split(" ")[2];
            if (!Number.isNaN(Number(id))) {
                await showNoteById(id);
            } else {
                showError('Invalid ID.');
            }
        } else if (cmd.startsWith("note edit ")) {
            const parts = raw.split(" ");
            const id = parts[2];
            
            if (Number.isNaN(Number(id))) {
                showError('Invalid ID.');
                return;
            }

            let content = parts.slice(3).join(" ").trim();
            if (!content) {
                showError('Usage: note edit <id> <new content> [--c to mark as complete/--uc to mark as uncomplete]');
                return;
            }

            // check for --c or --uc flags
            let complete;
            const completeMatch = content.match(/(.*?)\s*--c\s*$/i);
            const uncompleteMatch = content.match(/(.*?)\s*--uc\s*$/i);
            
            if (completeMatch) {
                content = completeMatch[1].trim();
                complete = 1;
            } else if (uncompleteMatch) {
                content = uncompleteMatch[1].trim();
                complete = 0;
            }

            await showUpdate(id, content, complete);
        } else if (cmd.startsWith("note remove ")) {
            const arg = raw.split(" ")[2];
            if (arg === '--a') {
                await deleteAllNotes();
            } else if (!Number.isNaN(Number(arg))) {
                await deleteNote(arg);
            } else {
                showError('Usage: note remove <id> or note remove --a to delete all notes');
            }
        } else if (cmd.startsWith("note ")) {
            const content = raw.substring(5).trim();
            if (!content) {
                showError('Usage: note <content>');
            } else {
                await newNote(content);
            }
        } else {
            showError('Invalid command.');
        }
    }
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

        notes.forEach(n => {
            const complete = (n.complete === 0 || n.complete === '0') ? 'n' : 'y';
            const p = document.createElement('p');
            p.textContent = `[${n.id}]: ${n.content} (complete: ${complete})`;
            p.className = 'ml-2 my-1 text-gray-300';
            resDiv.appendChild(p);
        });
        
        resDiv.scrollTo({ top: resDiv.scrollHeight, behavior: 'smooth' });
    } catch (err) {
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.className = 'text-red-500 ml-2 my-1';
        resDiv.appendChild(p);
        console.error(err);
    }
}

// SHOW INFO (total and completed notes)
async function showInfo() {
    const resDiv = document.getElementById('resDiv');
    try {
        const res = await fetch('/notes/info');
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err && err.error ? err.error : `Server returned ${res.status}`);
        }
        const info = await res.json();

        const p = document.createElement('p');
        p.textContent = `Total: ${info.total}, Complete: ${info.complete}`;
        p.className = 'ml-2 my-1 text-blue-400';
        resDiv.appendChild(p);
        
        resDiv.scrollTo({ top: resDiv.scrollHeight, behavior: 'smooth' });
    } catch (err) {
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.className = 'text-red-500 ml-2 my-1';
        resDiv.appendChild(p);
        console.error(err);
    }
}

// SHOW NOTE BY ID
async function showNoteById(id) {
    const resDiv = document.getElementById('resDiv');
    try {
        const res = await fetch(`/notes/${id}`);
        if (!res.ok) {
            if (res.status === 404) {
                const p = document.createElement('p');
                p.textContent = 'Not found.';
                p.className = 'text-red-500 ml-2 my-1';
                resDiv.appendChild(p);
                resDiv.scrollTo({ top: resDiv.scrollHeight, behavior: 'smooth' });
                return;
            }
            const err = await res.json().catch(() => null);
            throw new Error(err && err.error ? err.error : `Server returned ${res.status}`);
        }
        const noteId = await res.json();

        const complete = (noteId.complete === 0 || noteId.complete === '0') ? 'n' : 'y';
        const p = document.createElement('p');
        p.textContent = `[${noteId.id}]: ${noteId.content} (complete: ${complete})`;
        p.className = 'ml-2 my-1 text-gray-300';
        resDiv.appendChild(p);
        
        resDiv.scrollTo({ top: resDiv.scrollHeight, behavior: 'smooth' });
    } catch (err) {
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.className = 'text-red-500 ml-2 my-1';
        resDiv.appendChild(p);
        console.error(err);
    }
}

// SHOW UPDATE
async function showUpdate(id, newContent, complete) {
    const resDiv = document.getElementById('resDiv');
    try {
        const res = await fetch(`/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newContent, complete })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            const p = document.createElement('p');
            p.textContent = err && err.error ? err.error : `Failed (status ${res.status})`;
            p.className = 'text-red-500 ml-2 my-1';
            resDiv.appendChild(p);
            resDiv.scrollTo({ top: resDiv.scrollHeight, behavior: 'smooth' });
            return;
        }

        const updatedNote = await res.json();
        const p = document.createElement('p');
        const completeFlag = String(updatedNote.complete) === '1' ? 'y' : 'n';
        p.textContent = `Note updated: [${updatedNote.id}]: ${updatedNote.content} (complete: ${completeFlag})`;
        p.className = 'text-green-500 ml-2 my-1';
        resDiv.appendChild(p);
        
        resDiv.scrollTo({ top: resDiv.scrollHeight, behavior: 'smooth' });
    } catch (err) {
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.className = 'text-red-500 ml-2 my-1';
        resDiv.appendChild(p);
        console.error(err);
    }
}

// DELETE NOTE
async function deleteNote(id) {
    const resDiv = document.getElementById('resDiv');
    try {
        const res = await fetch(`/notes/${id}`, { method: 'DELETE' });
        if (res.status === 204) {
            const p = document.createElement('p');
            p.textContent = `Note ${id} deleted.`;
            p.className = 'text-green-500 ml-2 my-1';
            resDiv.appendChild(p);
            resDiv.scrollTo({ top: resDiv.scrollHeight, behavior: 'smooth' });
            return;
        }
        
        const err = await res.json().catch(() => null);
        const p = document.createElement('p');
        p.textContent = err && err.error ? err.error : `Failed to delete (status ${res.status})`;
        p.className = 'text-red-500 ml-2 my-1';
        resDiv.appendChild(p);
    } catch (err) {
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.className = 'text-red-500 ml-2 my-1';
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
            p.className = 'text-green-500 ml-2 my-1';
            resDiv.appendChild(p);
            resDiv.scrollTo({ top: resDiv.scrollHeight, behavior: 'smooth' });
            return;
        }
        
        const err = await res.json().catch(() => null);
        const p = document.createElement('p');
        p.textContent = err && err.error ? err.error : `Failed to delete all (status ${res.status})`;
        p.className = 'text-red-500 ml-2 my-1';
        resDiv.appendChild(p);
    } catch (err) {
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.className = 'text-red-500 ml-2 my-1';
        resDiv.appendChild(p);
        console.error(err);
    }
}

// NEW NOTE
async function newNote(content) {
    const resDiv = document.getElementById('resDiv');
    try {
        const res = await fetch('/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content })
        });
        
        if (!res.ok && res.status !== 201) {
            const err = await res.json().catch(() => null);
            const p = document.createElement('p');
            p.textContent = err && err.error ? err.error : `Failed (status ${res.status})`;
            p.className = 'text-red-500 ml-2 my-1';
            resDiv.appendChild(p);
            resDiv.scrollTo({ top: resDiv.scrollHeight, behavior: 'smooth' });
            return;
        }
        
        const addedNote = await res.json();
        const p = document.createElement('p');
        p.textContent = `New note added: [${addedNote.id}]: ${addedNote.content} (complete: ${addedNote.complete === '1' ? 'y' : 'n'})`;
        p.className = 'text-green-500 ml-2 my-1';
        resDiv.appendChild(p);
        
        resDiv.scrollTo({ top: resDiv.scrollHeight, behavior: 'smooth' });
    } catch (err) {
        const p = document.createElement('p');
        p.textContent = `Error: ${err.message}`;
        p.className = 'text-red-500 ml-2 my-1';
        resDiv.appendChild(p);
        console.error(err);
    }
}

front();
