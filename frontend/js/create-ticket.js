const API_URL = "http://127.0.0.1:8000/api/tickets";

const form = document.getElementById("ticketForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const customer_name =
            document.getElementById("customerName").value;

        const customer_email =
            document.getElementById("customerEmail").value;

        const subject =
            document.getElementById("subject").value;

        const description =
            document.getElementById("description").value;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer_name,
                customer_email,
                subject,
                description
            })
        });

        if (!response.ok) {
            throw new Error("Failed to create ticket");
        }

        const data = await response.json();

        // Store message for dashboard
        localStorage.setItem(
            "ticketCreated",
            `✓ ${data.ticket_id} created successfully`
        );

        // Redirect immediately
        window.location.href = "index.html";

    } catch (error) {

        console.error(error);

        alert("Unable to create ticket");

    }

});