/* =====================================================
   LEADFORGE V3
   CRM + TABLE + KANBAN PIPELINE
===================================================== */


/* =========================
   STORAGE
========================= */

let leads = JSON.parse(
    localStorage.getItem("leadforge_leads")
) || [];


const $ = (id) => document.getElementById(id);


function saveLeads() {

    localStorage.setItem(
        "leadforge_leads",
        JSON.stringify(leads)
    );

}


/* =========================
   DOM
========================= */

const modal = $("modal");
const leadForm = $("leadForm");

const searchInput = $("searchInput");
const statusFilter = $("statusFilter");
const priorityFilter = $("priorityFilter");

const leadsTable = $("leadsTable");
const emptyState = $("emptyState");

const tableView = $("tableView");
const pipelineView = $("pipelineView");

const tableViewBtn = $("tableViewBtn");
const pipelineViewBtn = $("pipelineViewBtn");

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

let currentView =
    localStorage.getItem("leadforge_view") || "table";


/* =========================
   HELPERS
========================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttr(value) {

    return escapeHTML(value);

}


function formatCurrency(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(number);

}


function normalizeWebsite(url) {

    if (!url) return "";

    const value = String(url).trim();

    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    return `https://${value}`;

}


function getLeadStatus(lead) {

    return lead.status || "New";

}


function getLeadPriority(lead) {

    return lead.priority || "Medium";

}


function getLeadValue(lead) {

    return Number(lead.value) || 0;

}


/* =========================
   FILTERED LEADS
========================= */

function getFilteredLeads() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const status =
        statusFilter.value;

    const priority =
        priorityFilter.value;


    return leads.filter((lead) => {

        const searchable = [

            lead.business,
            lead.contact,
            lead.email,
            lead.phone,
            lead.location,
            lead.source,
            lead.website,
            lead.notes

        ]
            .join(" ")
            .toLowerCase();


        const matchesSearch =
            searchable.includes(search);


        const matchesStatus =
            status === "all" ||
            getLeadStatus(lead) === status;


        const matchesPriority =
            priority === "all" ||
            getLeadPriority(lead) === priority;


        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
        );

    });

}


/* =====================================================
   MODAL
===================================================== */

function openModal(lead = null) {

    modal.classList.add("show");

    const editId = $("editId");

    if (lead) {

        editId.value = lead.id;

        $("business").value =
            lead.business || "";

        $("contact").value =
            lead.contact || "";

        $("email").value =
            lead.email || "";

        $("phone").value =
            lead.phone || "";

        $("website").value =
            lead.website || "";

        $("location").value =
            lead.location || "";

        $("source").value =
            lead.source || "Google Maps";

        $("value").value =
            lead.value || "";

        $("priority").value =
            getLeadPriority(lead);

        $("status").value =
            getLeadStatus(lead);

        $("notes").value =
            lead.notes || "";

    } else {

        leadForm.reset();

        editId.value = "";

        $("source").value =
            "Google Maps";

        $("priority").value =
            "Medium";

        $("status").value =
            "New";

    }

}


function closeModal() {

    modal.classList.remove("show");

}


/* =========================
   ADD / EDIT LEAD
========================= */

leadForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const editId =
            $("editId").value;


        const leadData = {

            business:
                $("business").value.trim(),

            contact:
                $("contact").value.trim(),

            email:
                $("email").value.trim(),

            phone:
                $("phone").value.trim(),

            website:
                $("website").value.trim(),

            location:
                $("location").value.trim(),

            source:
                $("source").value,

            value:
                Number($("value").value) || 0,

            priority:
                $("priority").value,

            status:
                $("status").value,

            notes:
                $("notes").value.trim()

        };


        if (!leadData.business) {

            showToast(
                "Missing information",
                "Please enter a business name."
            );

            return;

        }


        if (editId) {

            const index =
                leads.findIndex(
                    (lead) =>
                        String(lead.id) ===
                        String(editId)
                );


            if (index !== -1) {

                leads[index] = {

                    ...leads[index],
                    ...leadData

                };

            }


            showToast(
                "Lead updated",
                `${leadData.business} was updated successfully.`
            );

        } else {

            const newLead = {

                id:
                    Date.now(),

                ...leadData,

                date:
                    new Date().toISOString()

            };


            leads.unshift(newLead);


            showToast(
                "Lead added",
                `${leadData.business} was added to your pipeline.`
            );

        }


        saveLeads();

        closeModal();

        renderAll();

    }
);


/* =========================
   DELETE
========================= */

function deleteLead(id) {

    const lead =
        leads.find(
            (item) =>
                String(item.id) ===
                String(id)
        );


    if (!lead) return;


    const confirmed =
        confirm(
            `Delete "${lead.business}"?`
        );


    if (!confirmed) return;


    leads =
        leads.filter(
            (item) =>
                String(item.id) !==
                String(id)
        );


    saveLeads();

    renderAll();


    showToast(
        "Lead deleted",
        `${lead.business} was removed.`
    );

}


window.deleteLead = deleteLead;


/* =========================
   EDIT
========================= */

function editLead(id) {

    const lead =
        leads.find(
            (item) =>
                String(item.id) ===
                String(id)
        );


    if (!lead) return;


    openModal(lead);

}


window.editLead = editLead;


/* =====================================================
   TABLE
===================================================== */

function renderLeads() {

    const filtered =
        getFilteredLeads();


    visibleLeadCount.textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "lead"
                : "leads"
        }`;


    leadsTable.innerHTML = "";


    if (filtered.length === 0) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    filtered.forEach((lead) => {

        const row =
            document.createElement("tr");


        const contactHTML =
            lead.email

                ? `
                    <a href="mailto:${escapeAttr(
                        lead.email
                    )}">
                        ${escapeHTML(
                            lead.email
                        )}
                    </a>
                `

                : `
                    <span>
                        ${escapeHTML(
                            lead.contact ||
                            "No contact"
                        )}
                    </span>
                `;


        const website =
            normalizeWebsite(
                lead.website
            );


        row.innerHTML = `

            <td>

                <div class="business-cell">

                    <strong>
                        ${escapeHTML(
                            lead.business
                        )}
                    </strong>

                    ${
                        lead.location
                            ? `
                                <small>
                                    ${escapeHTML(
                                        lead.location
                                    )}
                                </small>
                              `
                            : ""
                    }

                </div>

            </td>


            <td>

                <div class="contact-cell">

                    ${contactHTML}

                    ${
                        lead.phone
                            ? `
                                <small>
                                    ${escapeHTML(
                                        lead.phone
                                    )}
                                </small>
                              `
                            : ""
                    }

                </div>

            </td>


            <td>

                <span class="source-tag">

                    ${escapeHTML(
                        lead.source ||
                        "Other"
                    )}

                </span>

            </td>


            <td>

                <span class="value-cell">

                    ${formatCurrency(
                        getLeadValue(lead)
                    )}

                </span>

            </td>


            <td>

                <span class="priority ${escapeAttr(
                    getLeadPriority(lead)
                )}">

                    ${escapeHTML(
                        getLeadPriority(lead)
                    )}

                </span>

            </td>


            <td>

                <span class="status ${escapeAttr(
                    getLeadStatus(lead)
                )}">

                    ${escapeHTML(
                        getLeadStatus(lead)
                    )}

                </span>

            </td>


            <td>

                <div class="action-buttons">

                    ${
                        website

                            ? `
                                <a
                                    class="action-btn"
                                    href="${escapeAttr(
                                        website
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
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


/* =====================================================
   KANBAN
===================================================== */

const PIPELINE_STATUSES = [
    "New",
    "Contacted",
    "Interested",
    "Closed"
];


function renderKanban() {

    const filtered =
        getFilteredLeads();


    PIPELINE_STATUSES.forEach(
        (status) => {

            const column =
                document.querySelector(
                    `.kanban-column[data-status="${status}"]`
                );


            if (!column) return;


            const dropzone =
                column.querySelector(
                    ".kanban-dropzone"
                );


            const countElement =
                column.querySelector(
                    `[data-count="${status}"]`
                );


            const valueElement =
                column.querySelector(
                    `[data-value="${status}"]`
                );


            const columnLeads =
                filtered.filter(
                    (lead) =>
                        getLeadStatus(lead) ===
                        status
                );


            const totalValue =
                columnLeads.reduce(
                    (sum, lead) =>
                        sum +
                        getLeadValue(lead),
                    0
                );


            countElement.textContent =
                columnLeads.length;


            valueElement.textContent =
                formatCurrency(totalValue);


            dropzone.innerHTML = "";


            if (columnLeads.length === 0) {

                dropzone.innerHTML = `

                    <div class="kanban-empty">

                        ${
                            statusFilter.value !== "all" ||
                            searchInput.value.trim() ||
                            priorityFilter.value !== "all"

                                ? "No matching leads"

                                : "Drop leads here"
                        }

                    </div>

                `;

                return;

            }


            columnLeads.forEach(
                (lead) => {

                    dropzone.appendChild(
                        createLeadCard(lead)
                    );

                }
            );

        }
    );

}


/* =========================
   CREATE CARD
========================= */

function createLeadCard(lead) {

    const card =
        document.createElement("div");


    card.className =
        "lead-card";


    card.draggable = true;


    card.dataset.id =
        lead.id;


    const website =
        normalizeWebsite(
            lead.website
        );


    card.innerHTML = `

        <div class="lead-card-top">

            <div class="lead-card-business">

                <strong title="${escapeAttr(
                    lead.business
                )}">

                    ${escapeHTML(
                        lead.business ||
                        "Untitled Lead"
                    )}

                </strong>


                ${
                    lead.location

                        ? `
                            <span class="lead-card-location">

                                ${escapeHTML(
                                    lead.location
                                )}

                            </span>
                          `

                        : ""
                }

            </div>


            <span
                class="drag-handle"
                title="Drag lead"
            >
                ⠿
            </span>

        </div>


        <div class="lead-card-value">

            ${formatCurrency(
                getLeadValue(lead)
            )}

        </div>


        <div class="lead-card-meta">

            <span class="lead-card-tag">

                ${escapeHTML(
                    lead.source ||
                    "Other"
                )}

            </span>


            <span
                class="lead-card-priority ${escapeAttr(
                    getLeadPriority(lead)
                )}"
            >

                ${escapeHTML(
                    getLeadPriority(lead)
                )}

            </span>

        </div>


        ${
            lead.contact ||
            lead.email ||
            lead.phone

                ? `

                    <div class="lead-card-contact">

                        ${
                            lead.contact
                                ? `
                                    <span>
                                        ${escapeHTML(
                                            lead.contact
                                        )}
                                    </span>
                                  `
                                : ""
                        }


                        ${
                            lead.email
                                ? `
                                    <a href="mailto:${escapeAttr(
                                        lead.email
                                    )}">
                                        ${escapeHTML(
                                            lead.email
                                        )}
                                    </a>
                                  `
                                : ""
                        }


                        ${
                            lead.phone
                                ? `
                                    <span>
                                        ${escapeHTML(
                                            lead.phone
                                        )}
                                    </span>
                                  `
                                : ""
                        }

                    </div>

                  `

                : ""
        }


        <div class="lead-card-actions">

            ${
                website

                    ? `
                        <a
                            class="card-action"
                            href="${escapeAttr(
                                website
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open website"
                        >
                            ↗
                        </a>
                      `

                    : ""
            }


            <button
                class="card-action"
                type="button"
                data-action="edit"
                title="Edit lead"
            >
                ✎
            </button>


            <button
                class="card-action delete"
                type="button"
                data-action="delete"
                title="Delete lead"
            >
                ×
            </button>

        </div>

    `;


    /* CARD CLICK */

    card.addEventListener(
        "click",
        (event) => {

            if (
                event.target.closest(
                    "button, a"
                )
            ) {
                return;
            }


            editLead(lead.id);

        }
    );


    /* EDIT */

    const editButton =
        card.querySelector(
            '[data-action="edit"]'
        );


    editButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            editLead(lead.id);

        }
    );


    /* DELETE */

    const deleteButton =
        card.querySelector(
            '[data-action="delete"]'
        );


    deleteButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            deleteLead(lead.id);

        }
    );


    /* DRAG START */

    card.addEventListener(
        "dragstart",
        (event) => {

            event.dataTransfer.effectAllowed =
                "move";

            event.dataTransfer.setData(
                "text/plain",
                String(lead.id)
            );


            card.classList.add(
                "dragging"
            );


            document
                .querySelectorAll(
                    ".kanban-dropzone"
                )
                .forEach(
                    (zone) =>
                        zone.classList.add(
                            "drag-active"
                        )
                );

        }
    );


    /* DRAG END */

    card.addEventListener(
        "dragend",
        () => {

            card.classList.remove(
                "dragging"
            );


            document
                .querySelectorAll(
                    ".kanban-dropzone"
                )
                .forEach(
                    (zone) =>
                        zone.classList.remove(
                            "drag-active"
                        )
                );


            document
                .querySelectorAll(
                    ".kanban-column"
                )
                .forEach(
                    (column) =>
                        column.classList.remove(
                            "drag-over"
                        )
                );

        }
    );


    return card;

}


/* =====================================================
   DRAG & DROP
===================================================== */

function setupKanbanDragDrop() {

    const columns =
        document.querySelectorAll(
            ".kanban-column"
        );


    columns.forEach(
        (column) => {

            const dropzone =
                column.querySelector(
                    ".kanban-dropzone"
                );


            /* DRAG OVER */

            dropzone.addEventListener(
                "dragover",
                (event) => {

                    event.preventDefault();

                    event.dataTransfer.dropEffect =
                        "move";


                    column.classList.add(
                        "drag-over"
                    );

                }
            );


            /* DRAG LEAVE */

            dropzone.addEventListener(
                "dragleave",
                (event) => {

                    if (
                        !dropzone.contains(
                            event.relatedTarget
                        )
                    ) {

                        column.classList.remove(
                            "drag-over"
                        );

                    }

                }
            );


            /* DROP */

            dropzone.addEventListener(
                "drop",
                (event) => {

                    event.preventDefault();


                    column.classList.remove(
                        "drag-over"
                    );


                    const id =
                        event.dataTransfer.getData(
                            "text/plain"
                        );


                    const newStatus =
                        column.dataset.status;


                    if (!id || !newStatus) {
                        return;
                    }


                    changeLeadStatus(
                        id,
                        newStatus
                    );

                }
            );

        }
    );

}


/* =========================
   CHANGE STATUS
========================= */

function changeLeadStatus(
    id,
    newStatus
) {

    const lead =
        leads.find(
            (item) =>
                String(item.id) ===
                String(id)
        );


    if (!lead) return;


    const oldStatus =
        getLeadStatus(lead);


    if (oldStatus === newStatus) {
        return;
    }


    lead.status =
        newStatus;


    saveLeads();

    renderAll();


    showToast(
        "Pipeline updated",
        `${lead.business} moved from ${oldStatus} to ${newStatus}.`
    );

}


/* =====================================================
   STATS
===================================================== */

function updateStats() {

    const total =
        leads.length;


    const newCount =
        leads.filter(
            (lead) =>
                getLeadStatus(lead) ===
                "New"
        ).length;


    const interestedCount =
        leads.filter(
            (lead) =>
                getLeadStatus(lead) ===
                "Interested"
        ).length;


    const closedCount =
        leads.filter(
            (lead) =>
                getLeadStatus(lead) ===
                "Closed"
        ).length;


    const pipeline =
        leads.reduce(
            (sum, lead) =>
                sum +
                getLeadValue(lead),
            0
        );


    const interested =
        leads
            .filter(
                (lead) =>
                    getLeadStatus(lead) ===
                    "Interested"
            )
            .reduce(
                (sum, lead) =>
                    sum +
                    getLeadValue(lead),
                0
            );


    const closed =
        leads
            .filter(
                (lead) =>
                    getLeadStatus(lead) ===
                    "Closed"
            )
            .reduce(
                (sum, lead) =>
                    sum +
                    getLeadValue(lead),
                0
            );


    const rate =
        total > 0
            ? (
                closed /
                total *
                100
            )
            : 0;


    totalLeads.textContent =
        total;


    newLeads.textContent =
        newCount;


    interestedLeads.textContent =
        interestedCount;


    closedLeads.textContent =
        closedCount;


    pipelineValue.textContent =
        formatCurrency(
            pipeline
        );


    interestedValue.textContent =
        formatCurrency(
            interested
        );


    closedValue.textContent =
        formatCurrency(
            closed
        );


    conversionRate.textContent =
        `${rate.toFixed(1)}%`;


    conversionClosed.textContent =
        closed;


    conversionTotal.textContent =
        total;


    const progress =
        pipeline > 0
            ? (
                closed /
                pipeline *
                100
            )
            : 0;


    if (pipelineProgress) {

        pipelineProgress.style.width =
            `${Math.min(
                progress,
                100
            )}%`;

    }


    if (sidebarLeadCount) {

        sidebarLeadCount.textContent =
            total;

    }

}


/* =====================================================
   SEARCH + FILTER
===================================================== */

searchInput.addEventListener(
    "input",
    renderAll
);


statusFilter.addEventListener(
    "change",
    renderAll
);


priorityFilter.addEventListener(
    "change",
    renderAll
);


/* =====================================================
   VIEW SWITCHER
===================================================== */

function setView(view) {

    currentView =
        view;


    localStorage.setItem(
        "leadforge_view",
        view
    );


    if (view === "pipeline") {

        tableView.style.display =
            "none";

        pipelineView.style.display =
            "block";


        tableViewBtn.classList.remove(
            "active"
        );

        pipelineViewBtn.classList.add(
            "active"
        );

    } else {

        tableView.style.display =
            "block";

        pipelineView.style.display =
            "none";


        tableViewBtn.classList.add(
            "active"
        );

        pipelineViewBtn.classList.remove(
            "active"
        );

    }


    renderAll();

}


tableViewBtn.addEventListener(
    "click",
    () => setView("table")
);


pipelineViewBtn.addEventListener(
    "click",
    () => setView("pipeline")
);


/* =====================================================
   EXPORT CSV
===================================================== */

function exportCSV() {

    if (!leads.length) {

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


    const rows =
        leads.map(
            (lead) => [

                lead.business || "",
                lead.contact || "",
                lead.email || "",
                lead.phone || "",
                lead.website || "",
                lead.location || "",
                lead.source || "",
                lead.value || 0,
                getLeadPriority(lead),
                getLeadStatus(lead),
                lead.notes || "",
                lead.date || ""

            ]
        );


    const csv = [

        headers,

        ...rows

    ]
        .map(
            (row) =>
                row
                    .map(
                        (value) =>
                            `"${String(value)
                                .replace(
                                    /"/g,
                                    '""'
                                )}"`
                    )
                    .join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `leadforge-leads-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "CSV exported",
        `${leads.length} leads exported successfully.`
    );

}


window.exportCSV = exportCSV;


/* =====================================================
   THEME
===================================================== */

const themeToggle =
    $("themeToggle");


function applyTheme(theme) {

    document.documentElement.dataset.theme =
        theme;


    localStorage.setItem(
        "leadforge_theme",
        theme
    );

}


const savedTheme =
    localStorage.getItem(
        "leadforge_theme"
    );


if (savedTheme) {

    applyTheme(
        savedTheme
    );

}


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            const current =
                document.documentElement.dataset.theme ||
                "dark";


            const next =
                current === "dark"
                    ? "light"
                    : "dark";


            applyTheme(
                next
            );

        }
    );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    title,
    message
) {

    if (!toast) return;


    toastTitle.textContent =
        title;


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3200
        );

}


/* =====================================================
   MODAL BUTTONS
===================================================== */

const addLeadBtn =
    $("addLeadBtn");


const topAddLeadBtn =
    $("topAddLeadBtn");


const emptyAddBtn =
    $("emptyAddBtn");


if (addLeadBtn) {

    addLeadBtn.addEventListener(
        "click",
        () => openModal()
    );

}


if (topAddLeadBtn) {

    topAddLeadBtn.addEventListener(
        "click",
        () => openModal()
    );

}


if (emptyAddBtn) {

    emptyAddBtn.addEventListener(
        "click",
        () => openModal()
    );

}


/* CLOSE MODAL */

const modalClose =
    $("modalClose");


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


if (modal) {

    modal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                modal
            ) {

                closeModal();

            }

        }
    );

}


/* =====================================================
   KEYBOARD SHORTCUTS
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        const target =
            event.target;


        const isTyping =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT";


        /* N = New lead */

        if (
            event.key.toLowerCase() ===
                "n" &&
            !isTyping
        ) {

            event.preventDefault();

            openModal();

        }


        /* CTRL/CMD + K = Search */

        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            event.key.toLowerCase() ===
                "k"
        ) {

            event.preventDefault();

            searchInput.focus();

        }


        /* ESC = Close modal */

        if (
            event.key ===
            "Escape"
        ) {

            closeModal();

        }

    }
);


/* =====================================================
   DATE
===================================================== */

const currentDate =
    $("currentDate");


if (currentDate) {

    currentDate.textContent =
        new Date().toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

}


/* =====================================================
   INITIALIZE
===================================================== */

setupKanbanDragDrop();

setView(
    currentView
);

renderAll();
