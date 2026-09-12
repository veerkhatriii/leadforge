let leads = JSON.parse(localStorage.getItem("leadforge_leads")) || [];

const modal = document.getElementById("modal");
const leadForm = document.getElementById("leadForm");

const openModalBtn = document.getElementById("openModalBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");

const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const leadsTable = document.getElementById("leadsTable");
const emptyState = document.getElementById("emptyState");

const totalLeads = document.getElementById("totalLeads");
const newLeads = document.getElementById("newLeads");
const interestedLeads = document.getElementById("interestedLeads");
const closedLeads = document.getElementById("closedLeads");

const exportBtn = document.getElementById("exportBtn");


/* Open modal */

function openModal() {
    modal.classList.add("show");

    document.getElementById("business").focus();
}


/* Close modal */

function closeModal() {
    modal.classList.remove("show");
    leadForm.reset();
}


openModalBtn.addEventListener("click", openModal);

emptyAddBtn.addEventListener("click", openModal);

closeModalBtn.addEventListener("click", closeModal);

cancelBtn.addEventListener("click", closeModal);


/* Close when clicking outside */

modal.addEventListener("click", function (event) {

    if (event.target === modal) {
        closeModal();
    }

});


/* Add lead */

leadForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const lead = {

        id: Date.now(),

        business: document.getElementById("business").value.trim(),

        contact: document.getElementById("contact").value.trim(),

        email: document.getElementById("email").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        website: document.getElementById("website").value.trim(),

        location: document.getElementById("location").value.trim(),

        status: document.getElementById("status").value,

        date: new Date().toLocaleDateString()

    };


    leads.unshift(lead);

    saveLeads();

    renderLeads();

    updateStats();

    closeModal();

});


/* Save */

function saveLeads() {

    localStorage.setItem(
        "leadforge_leads",
        JSON.stringify(leads)
    );

}


/* Delete */

function deleteLead(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this lead?"
    );

    if (!confirmed) return;

    leads = leads.filter(function (lead) {

        return lead.id !== id;

    });

    saveLeads();

    renderLeads();

    updateStats();

}


/* Render */

function renderLeads() {

    const search = searchInput.value
        .toLowerCase()
        .trim();

    const filter = statusFilter.value;


    const filteredLeads = leads.filter(function (lead) {

        const matchesSearch =
            lead.business.toLowerCase().includes(search) ||
            lead.contact.toLowerCase().includes(search) ||
            lead.email.toLowerCase().includes(search) ||
            lead.location.toLowerCase().includes(search);

        const matchesStatus =
            filter === "all" ||
            lead.status === filter;

        return matchesSearch && matchesStatus;

    });


    leadsTable.innerHTML = "";


    if (filteredLeads.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    filteredLeads.forEach(function (lead) {

        const row = document.createElement("tr");


        row.innerHTML = `

            <td>

                <div class="business-name">
                    ${escapeHTML(lead.business)}
                </div>

                ${
                    lead.email
                        ? `<small>${escapeHTML(lead.email)}</small>`
                        : ""
                }

            </td>


            <td>

                ${escapeHTML(lead.contact || "—")}

                ${
                    lead.phone
                        ? `<small>${escapeHTML(lead.phone)}</small>`
                        : ""
                }

            </td>


            <td>
                ${escapeHTML(lead.location || "—")}
            </td>


            <td>

                <span class="status ${lead.status}">
                    ${lead.status}
                </span>

            </td>


            <td>
                ${lead.date}
            </td>


            <td>

                <button
                    class="delete-btn"
                    onclick="deleteLead(${lead.id})"
                    title="Delete lead"
                >
                    🗑
                </button>

            </td>

        `;


        leadsTable.appendChild(row);

    });

}


/* Update stats */

function updateStats() {

    totalLeads.textContent = leads.length;

    newLeads.textContent =
        leads.filter(lead => lead.status === "New").length;

    interestedLeads.textContent =
        leads.filter(lead => lead.status === "Interested").length;

    closedLeads.textContent =
        leads.filter(lead => lead.status === "Closed").length;

}


/* Search */

searchInput.addEventListener(
    "input",
    renderLeads
);


/* Filter */

statusFilter.addEventListener(
    "change",
    renderLeads
);


/* CSV Export */

exportBtn.addEventListener("click", function () {

    if (leads.length === 0) {

        alert("There are no leads to export.");

        return;

    }


    const headers = [
        "Business",
        "Contact",
        "Email",
        "Phone",
        "Website",
        "Location",
        "Status",
        "Date"
    ];


    const rows = leads.map(function (lead) {

        return [

            lead.business,
            lead.contact,
            lead.email,
            lead.phone,
            lead.website,
            lead.location,
            lead.status,
            lead.date

        ];

    });


    const csv = [

        headers,
        ...rows

    ]
        .map(row =>
            row.map(value =>
                `"${String(value || "").replace(/"/g, '""')}"`
            ).join(",")
        )
        .join("\n");


    const blob = new Blob(
        [csv],
        {
            type: "text/csv;charset=utf-8;"
        }
    );


    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "leadforge-leads.csv";

    link.click();

    URL.revokeObjectURL(url);

});


/* Security helper */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* Initial load */

renderLeads();

updateStats();
