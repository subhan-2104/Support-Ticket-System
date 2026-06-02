const API_URL = "https://support-ticket-system-production-45dd.up.railway.app/api/tickets";

loadTickets();

async function loadTickets() {

    const search =
        document.getElementById("searchInput")?.value || "";

    const status =
        document.getElementById("statusFilter")?.value || "";

    let url = API_URL;

    let params = [];

    if (search) {
        params.push(`search=${encodeURIComponent(search)}`);
    }

    if (status) {
        params.push(`status=${encodeURIComponent(status)}`);
    }

    if (params.length > 0) {
        url += "?" + params.join("&");
    }

    try {

        const response = await fetch(url);
        const tickets = await response.json();

        const table = document.getElementById("ticketTable");

        if (!table) return;

        table.innerHTML = "";

        let open = 0;
        let progress = 0;
        let closed = 0;

        tickets.forEach(ticket => {

            if (ticket.status === "Open") open++;
            if (ticket.status === "In Progress") progress++;
            if (ticket.status === "Closed") closed++;

            let badgeClass = "closed";

            if (ticket.status === "Open") {
                badgeClass = "open";
            }
            else if (ticket.status === "In Progress") {
                badgeClass = "progress";
            }

            table.innerHTML += `
                <tr>
                    <td>${ticket.ticket_id}</td>

                    <td>${ticket.customer_name}</td>

                    <td>${ticket.subject}</td>

                    <td>
                        <span class="status-badge ${badgeClass}">
                            ${ticket.status}
                        </span>
                    </td>

                    <td>
                        <a
                            class="view-btn"
                            href="ticket-detail.html?id=${ticket.ticket_id}">
                            View
                        </a>
                    </td>
                </tr>
            `;
        });

        document.getElementById("totalCount").innerText =
            tickets.length;

        document.getElementById("openCount").innerText =
            open;

        document.getElementById("progressCount").innerText =
            progress;

        document.getElementById("closedCount").innerText =
            closed;

    } catch (error) {

        console.error("Error loading tickets:", error);

        const table = document.getElementById("ticketTable");

        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">
                        Failed to load tickets
                    </td>
                </tr>
            `;
        }
    }
}

document
    .getElementById("searchInput")
    ?.addEventListener("keyup", loadTickets);

document
    .getElementById("statusFilter")
    ?.addEventListener("change", loadTickets);

const createdMessage =
    localStorage.getItem("ticketCreated");

if (createdMessage) {

    const toast =
        document.getElementById("toast");

    toast.textContent =
        createdMessage;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

        localStorage.removeItem(
            "ticketCreated"
        );

    }, 3000);
}