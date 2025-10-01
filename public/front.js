// this front() calls the showNotes() function when the user presses Enter in the input field or submits the form
export default function front() {
    const input = document.getElementById('input');
    const form = document.getElementById('form');
    
    //CLEAR
    function clearRes() {
        const resDiv = document.getElementById('resDiv');
        resDiv.innerHTML = '';
    }

    //MSG ERROR
    function showError(message){
        const resDiv = document.getElementById('resDiv');
        const p = document.createElement('p');
        p.textContent = `Error: ${message}`;
        resDiv.appendChild(p);
    }

    //COMMANDS
    input.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const cmd = input.value.trim().toLowerCase();
            if(cmd === "note list"){
                showNotes();
            }else if(cmd === "clear"){
                clearRes();
            }else{
                showError('Invalid command.');
            }
        }
    });
}

//SHOW ALL NOTES
async function showNotes() {
    const resDiv = document.getElementById('resDiv');
    try {
        const res = await fetch('http://localhost:3000/notes/list');
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
        resDiv.appendChild(p);
        console.error(err);
    }
}

front();
