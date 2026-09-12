let leads = JSON.parse(
    localStorage.getItem("leadforge_leads")
) || [];

const $ = (id) => document.getElementById(id);

const modal = $("modal");
const leadForm = $("leadForm");

const searchInput = $("searchInput");
const statusFilter = $("statusFilter");
const priorityFilter = $("priorityFilter");

const leadsTable = $("leadsTable");
const emptyState = $("emptyState");

const totalLeads = $("totalLeads");
const newLeads = $("newLeads");
const interestedLeads = $("interestedLeads");
const closedLeads = $("closedLeads");

const pipelineValue = $("pipelineValue");
const interestedValue = $("interestedValue");
const closedValue = $("closedValue");

const conversionRate = $("conversionRate");
const conversionClosed = $("conversionClosed");
const conversionTotal = $("conversionTotal");

const pipelineProgress = $("pipelineProgress");

const sidebarLeadCount = $("sidebarLeadCount");
const visibleLeadCount = $("visibleLeadCount");

const toast = $("toast");
const toastTitle = $("toastTitle");
const toastMessage = $("toastMessage");

let toastTimer;


/* =========================
   STORAGE
========================= */

function saveLeads() {

    localStorage.setItem(
        "leadforge_leads",
        JSON.stringify(leads)
    );

}


/* =========================
   MODAL
========================= */

function openModal(lead = null) {

    modal.classList.add("show");

    if (lead) {

        $("modalTitle").textContent = "Edit lead";

        $("submitText").textContent = "Save changes";

        $("editId").value = lead.id;

        $("business").value = lead.business || "";

        $("contact").value = lead.contact || "";

        $("email").value = lead.email || "";

        $("phone").value = lead.phone || "";

        $("website").value = lead.website || "";

        $("location").value = lead.location || "";

        $("source").value = lead.source || "Other";

        $("value").value = lead.value || "";

        $("priority").value = lead.priority || "Medium";

        $("status").value = lead.status || "New";

        $("notes").value = lead.notes || "";

    } else {

        $("modalTitle").textContent = "Add a new lead";

        $("submitText").textContent = "Add Lead";

        $("editId").value = "";

        leadForm.reset();

        $("priority").value = "Medium";

        $("status").value = "New";

    }

    setTimeout(() => $("business").focus(), 50);
}


function closeModal() {

    modal.classList.remove("show");

    leadForm.reset();

    $("editId").value = "";

}


/* Buttons */

$("openModalBtn").addEventListener(
    "click",
    () => openModal()
);

$("sidebarAddBtn").addEventListener(
    "click",
    () => openModal()
);

$("emptyAddBtn").addEventListener(
    "click",
    () => openModal()
);

$("closeModalBtn").addEventListener(
    "click",
    closeModal
);

$("cancelBtn").addEventListener(
    "click",
    closeModal
);


modal.addEventListener("click", (event) => {

    if (event.target === modal) {
        closeModal();
    }

});


/* Escape */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeModal();
    }

});


/* =========================
   ADD / EDIT
========================= */

leadForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const editId = $("editId").value;


    const leadData = {

        business: $("business").value.trim(),

        contact: $("contact").value.trim(),

        email: $("email").value.trim(),

        phone: $("phone").value.trim(),

        website: $("website").value.trim(),

        location: $("location").value.trim(),

        source: $("source").value,

        value: Number($("value").value) || 0,

        priority: $("priority").value,

        status: $("status").value,

        notes: $("notes").value.trim()

    };


    if (!leadData.business) {

        showToast(
            "Missing information",
            "Business name is required."
        );

        return;

    }


    /* EDIT */

    if (editId) {

        const index = leads.findIndex(
            lead => String(lead.id) === String(editId)
        );


        if (index !== -1) {

            leads[index] = {
                ...leads[index],
                ...leadData
            };

        }


        saveLeads();

        renderAll();

        closeModal();

        showToast(
            "Lead updated",
            `${leadData.business} was updated successfully.`
        );


        return;
    }


    /* NEW LEAD */

    const newLead = {

        id: Date.now(),

        ...leadData,

        date: new Date().toISOString()

    };


    leads.unshift(newLead);

    saveLeads();

    renderAll();

    closeModal();


    showToast(
        "Lead added",
        `${newLead.business} was added to your pipeline.`
    );

});


/* =========================
   DELETE
========================= */

function deleteLead(id) {

    const lead = leads.find(
        item => item.id === id
    );

    if (!lead) return;


    const confirmed = confirm(
        `Delete "${lead.business}"?`
    );


    if (!confirmed) return;


    leads = leads.filter(
        item => item.id !== id
    );


    saveLeads();

    renderAll();


    showToast(
        "Lead deleted",
        `${lead.business} was removed.`
    );

}


/* =========================
   EDIT
========================= */

function editLead(id) {

    const lead = leads.find(
        item => item.id === id
    );

    if (!lead) return;

    openModal(lead);

}


/* =========================
   RENDER TABLE
========================= */

function renderLeads() {

    const search = searchInput.value
        .toLowerCase()
        .trim();

    const status = statusFilter.value;

    const priority = priorityFilter.value;


    const filtered = leads.filter((lead) => {

        const searchable = [

            lead.business,
            lead.contact,
            lead.email,
            lead.phone,
            lead.location,
            lead.source

        ]
            .join(" ")
            .toLowerCase();


        const matchesSearch =
            searchable.includes(search);


        const matchesStatus =
            status === "all" ||
            lead.status === status;


        const matchesPriority =
            priority === "all" ||
            lead.priority === priority;


        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
        );

    });


    leadsTable.innerHTML = "";


    visibleLeadCount.textContent =
        `${filtered.length} ${filtered.length === 1 ? "lead" : "leads"}`;


    if (filtered.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    filtered.forEach((lead) => {

        const row = document.createElement("tr");


        const contactHTML = lead.email

            ? `
                <a href="mailto:${escapeAttr(lead.email)}">
                    ${escapeHTML(lead.email)}
                </a>
            `

            : `<span>${escapeHTML(lead.contact || "No contact")}</span>`;


        const value = formatCurrency(lead.value);


        row.innerHTML = `

            <td>

                <div class="business-cell">

                    <strong>
                        ${escapeHTML(lead.business)}
                    </strong>

                    ${
                        lead.location
                            ? `<small>${escapeHTML(lead.location)}</small>`
                            : ""
                    }

                </div>

            </td>


            <td>

                <div class="contact-cell">

                    ${contactHTML}

                    ${
                        lead.phone
                            ? `<small>${escapeHTML(lead.phone)}</small>`
                            : ""
                    }

                </div>

            </td>


            <td>

                <span class="source-tag">
                    ${escapeHTML(lead.source || "Other")}
                </span>

            </td>


            <td>

                <span class="value-cell">
                    ${value}
                </span>

            </td>


            <td>

                <span class="priority ${escapeAttr(lead.priority || "Medium")}">
                    ${escapeHTML(lead.priority || "Medium")}
                </span>

            </td>


            <td>

                <span class="status ${escapeAttr(lead.status || "New")}">
                    ${escapeHTML(lead.status || "New")}
                </span>

            </td>


            <td>

                <div class="action-buttons">

                    ${
                        lead.website
                            ? `
                                <a
                                    class="action-btn"
                                    href="${escapeAttr(lead.website)}"
                                    target="_blank"
                                    rel="noopener"
                                    title="Open website"
                                >
                                    ↗
                                </a>
                            `
                            : ""
                    }


                    <button
                        class="action-btn"
                        onclick="editLead(${lead.id})"
                        title="Edit"
                    >
                        ✎
                    </button>


                    <button
                        class="action-btn delete"
                        onclick="deleteLead(${lead.id})"
                        title="Delete"
                    >
                        ×
                    </button>

                </div>

            </td>

        `;


        leadsTable.appendChild(row);

    });

}


/* =========================
   STATS
========================= */

function updateStats() {

    const total = leads.length;

    const fresh = leads.filter(
        lead => lead.status === "New"
    ).length;

    const interested = leads.filter(
        lead => lead.status === "Interested"
    ).length;

    const closed = leads.filter(
        lead => lead.status === "Closed"
    ).length;


    const totalValue = leads.reduce(
        (sum, lead) => sum + Number(lead.value || 0),
        0
    );


    const interestedVal = leads
        .filter(lead => lead.status === "Interested")
        .reduce(
            (sum, lead) => sum + Number(lead.value || 0),
            0
        );


    const closedVal = leads
        .filter(lead => lead.status === "Closed")
        .reduce(
            (sum, lead) => sum + Number(lead.value || 0),
            0
        );


    totalLeads.textContent = total;

    newLeads.textContent = fresh;

    interestedLeads.textContent = interested;

    closedLeads.textContent = closed;


    pipelineValue.textContent =
        formatCurrency(totalValue);

    interestedValue.textContent =
        formatCurrency(interestedVal);

    closedValue.textContent =
        formatCurrency(closedVal);


    conversionTotal.textContent = total;

    conversionClosed.textContent = closed;


    const rate =
        total === 0
            ? 0
            : (closed / total) * 100;


    conversionRate.textContent =
        `${rate.toFixed(1)}%`;


    const circleDegrees =
        Math.min(rate, 100) * 3.6;


    document.querySelector(
        ".conversion-circle"
    ).style.background =
        `conic-gradient(
            var(--accent) ${circleDegrees}deg,
            #1c2028 ${circleDegrees}deg
        )`;


    const progress =
        totalValue === 0
            ? 0
            : Math.min(
                (closedVal / totalValue) * 100,
                100
            );


    pipelineProgress.style.width =
        `${progress}%`;


    sidebarLeadCount.textContent = total;

}


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    renderLeads
);

statusFilter.addEventListener(
    "change",
    renderLeads
);

priorityFilter.addEventListener(
    "change",
    renderLeads
);


/* =========================
   EXPORT CSV
========================= */

function exportCSV() {

    if (leads.length === 0) {

        showToast(
            "Nothing to export",
            "Add at least one lead first."
        );

        return;

    }


    const headers = [

        "Business",
        "Contact",
        "Email",
        "Phone",
        "Website",
        "Location",
        "Source",
        "Value",
        "Priority",
        "Status",
        "Notes",
        "Date"

    ];


    const rows = leads.map(lead => [

        lead.business,
        lead.contact,
        lead.email,
        lead.phone,
        lead.website,
        lead.location,
        lead.source,
        lead.value,
        lead.priority,
        lead.status,
        lead.notes,
        formatDate(lead.date)

    ]);


    const csv = [

        headers,
        ...rows

    ]
        .map(row =>
            row
                .map(value =>
                    `"${String(value ?? "")
                        .replace(/"/g, '""')}"`
                )
                .join(",")
        )
        .join("\n");


    const blob = new Blob(
        [csv],
        {
            type: "text/csv;charset=utf-8;"
        }
    );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        `leadforge-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);


    showToast(
        "Export complete",
        `${leads.length} leads exported to CSV.`
    );

}


$("sidebarExportBtn").addEventListener(
    "click",
    exportCSV
);


/* =========================
   THEME
========================= */

const savedTheme =
    localStorage.getItem("leadforge_theme");


if (savedTheme === "light") {

    document.body.classList.add("light");

    $("themeBtn").textContent = "☀";

}


$("themeBtn").addEventListener("click", () => {

    document.body.classList.toggle("light");


    const isLight =
        document.body.classList.contains("light");


    localStorage.setItem(
        "leadforge_theme",
        isLight ? "light" : "dark"
    );


    $("themeBtn").textContent =
        isLight ? "☀" : "☾";

});


/* =========================
   KEYBOARD SHORTCUT
========================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key.toLowerCase() === "n" &&
            !["INPUT", "TEXTAREA", "SELECT"].includes(
                document.activeElement.tagName
            )
        ) {

            event.preventDefault();

            openModal();

        }


        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            searchInput.focus();

        }

    }
);


/* =========================
   DATE
========================= */

$("currentDate").textContent =
    new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    ).format(new Date());


/* =========================
   TOAST
========================= */

function showToast(title, message) {

    toastTitle.textContent = title;

    toastMessage.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =========================
   HELPERS
========================= */

function formatCurrency(number) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(number || 0);

}


function formatDate(date) {

    if (!date) return "—";


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(new Date(date));

}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttr(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

}


/* =========================
   INITIALIZE
========================= */

function renderAll() {

    renderLeads();

    updateStats();

}


renderAll();
