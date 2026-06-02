const API_URL =
    "http://127.0.0.1:8000/api/tickets";

const params =
    new URLSearchParams(window.location.search);

const ticketId =
    params.get("id");

loadTicket();

async function loadTicket() {

    try {

        const response =
            await fetch(`${API_URL}/${ticketId}`);

        const ticket =
            await response.json();

        document.getElementById("customerInfo")
        .innerHTML = `
            <p><strong>Name:</strong>
            ${ticket.customer_name}</p>

            <p><strong>Email:</strong>
            ${ticket.customer_email}</p>
        `;

        document.getElementById("ticketInfo")
        .innerHTML = `
            <p><strong>Ticket ID:</strong>
            ${ticket.ticket_id}</p>

            <p><strong>Subject:</strong>
            ${ticket.subject}</p>

            <p><strong>Description:</strong>
            ${ticket.description}</p>
        `;

        document.getElementById("status").value =
            ticket.status;

        renderNotes(ticket.notes);

    } catch(error) {

        console.error(error);

        alert("Unable to load ticket");

    }
}

function renderNotes(notes){

    const container =
        document.getElementById("notesContainer");

    if(!notes.length){

        container.innerHTML =
            "<p>No notes available.</p>";

        return;
    }

    container.innerHTML = "";

    notes.forEach(note => {

        container.innerHTML += `
            <div class="note-card">

                <p>${note.text}</p>

                <small>
                    ${new Date(
                        note.created_at
                    ).toLocaleString()}
                </small>

            </div>
        `;
    });
}

document
.getElementById("saveBtn")
.addEventListener("click", updateTicket);

async function updateTicket(){

    const status =
        document.getElementById("status").value;

    const note =
        document.getElementById("note").value;

    try {

        const response =
            await fetch(`${API_URL}/${ticketId}`, {

                method:"PUT",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({
                    status,
                    note
                })
            });

        const data =
            await response.json();

        alert("Ticket Updated Successfully");

        document.getElementById("note").value = "";

        loadTicket();

    } catch(error){

        console.error(error);

        alert("Update Failed");

    }
}