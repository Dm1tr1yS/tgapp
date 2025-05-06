// Состояние приложения
const state = {
    currentDate: new Date(),
    appointments: [
        {
            id: 1,
            date: new Date().toISOString().split("T")[0],
            time: "14:00",
            clientName: "Тестовый клиент",
            clientPhone: "+79161234567",
            serviceId: 1,
            serviceName: "Маникюр",
            price: 1000,
            notes: "",
        },
    ],
    services: [
        { id: 1, name: "Маникюр", price: 1000 },
        { id: 2, name: "Покрытие гель-лак", price: 1500 },
    ],
    currentEditId: null,
};

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    renderAppointmentsTable();
    setupEventListeners();
    console.log("Приложение инициализировано");
}

// Рендер таблицы с обработчиками редактирования
function renderAppointmentsTable() {
    const container = document.getElementById("appointments-table-container");
    if (!container) return;

    container.innerHTML = "";
    const table = document.createElement("table");
    table.className = "appointments-table";

    // Шапка таблицы
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th class="time-column">Время</th>
        ${generateDateHeaders()}
    `;
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement("tbody");
    for (let hour = 10; hour <= 19; hour++) {
        const time = `${hour}:00`;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="time-column">${time}</td>
            ${generateDayCells(time)}
        `;
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    container.appendChild(table);
}

function generateDateHeaders() {
    let headers = "";
    const daysInMonth = new Date(
        state.currentDate.getFullYear(),
        state.currentDate.getMonth() + 1,
        0
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(
            state.currentDate.getFullYear(),
            state.currentDate.getMonth(),
            day
        );
        headers += `
            <th>
                <div class="date-header">
                    <div class="date-day">${day}</div>
                    <div class="date-weekday">${
                        ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][
                            date.getDay()
                        ]
                    }</div>
                </div>
            </th>
        `;
    }
    return headers;
}

function generateDayCells(time) {
    let cells = "";
    const daysInMonth = new Date(
        state.currentDate.getFullYear(),
        state.currentDate.getMonth() + 1,
        0
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(
            new Date(
                state.currentDate.getFullYear(),
                state.currentDate.getMonth(),
                day
            )
        );

        const appointment = state.appointments.find(
            (a) => a.date === dateStr && a.time === time
        );

        cells += `
            <td class="appointment-cell" 
                data-date="${dateStr}" 
                data-time="${time}"
                ${appointment ? `data-id="${appointment.id}"` : ""}>
                ${
                    appointment
                        ? `
                    <div class="appointment-info">
                        <div class="client-name">${appointment.clientName}</div>
                        <div class="service-name">${appointment.serviceName}</div>
                        <div>${appointment.price} руб.</div>
                    </div>
                `
                        : ""
                }
            </td>
        `;
    }
    return cells;
}

// Обработчики событий
function setupEventListeners() {
    // Клик по ячейке таблицы
    document.addEventListener("click", (e) => {
        const cell = e.target.closest(".appointment-cell");
        if (!cell) return;

        const appointmentId = cell.dataset.id;
        if (!appointmentId) return;

        showEditPopup(cell, parseInt(appointmentId));
    });

    // Сохранение записи
    document
        .getElementById("save-appointment")
        .addEventListener("click", saveAppointment);

    // Отмена редактирования
    document.getElementById("cancel-form").addEventListener("click", () => {
        document.getElementById("add-modal").style.display = "none";
        state.currentEditId = null;
    });
}

// Показ попапа редактирования
function showEditPopup(cell, appointmentId) {
    const popup = document.createElement("div");
    popup.className = "edit-popup";
    popup.innerHTML = `
        <button class="edit-btn">✏️ Редактировать</button>
    `;

    const rect = cell.getBoundingClientRect();
    popup.style.position = "absolute";
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.top - 40}px`;

    popup.querySelector(".edit-btn").addEventListener("click", () => {
        openEditForm(appointmentId);
        popup.remove();
    });

    document.body.appendChild(popup);

    // Закрытие при клике вне попапа
    setTimeout(() => {
        const closeHandler = (e) => {
            if (!popup.contains(e.target)) {
                popup.remove();
                document.removeEventListener("click", closeHandler);
            }
        };
        document.addEventListener("click", closeHandler);
    }, 100);
}

// Открытие формы редактирования
function openEditForm(appointmentId) {
    const appointment = state.appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;

    state.currentEditId = appointmentId;

    // Заполняем форму
    document.getElementById("appointment-date").value = appointment.date;
    document.getElementById("appointment-time").value = appointment.time;
    document.getElementById("client-name").value = appointment.clientName;
    document.getElementById("client-phone").value = appointment.clientPhone;
    document.getElementById("service").value = appointment.serviceId;
    document.getElementById("notes").value = appointment.notes || "";

    // Показываем модальное окно
    document.getElementById("add-modal").style.display = "flex";
    document.querySelector("#add-modal h3").textContent =
        "Редактировать запись";
}

// Сохранение изменений
function saveAppointment() {
    const formData = {
        date: document.getElementById("appointment-date").value,
        time: document.getElementById("appointment-time").value,
        clientName: document.getElementById("client-name").value,
        clientPhone: document.getElementById("client-phone").value,
        serviceId: parseInt(document.getElementById("service").value),
        notes: document.getElementById("notes").value,
    };

    if (state.currentEditId) {
        // Редактирование существующей записи
        const index = state.appointments.findIndex(
            (a) => a.id === state.currentEditId
        );
        if (index !== -1) {
            const service = state.services.find(
                (s) => s.id === formData.serviceId
            );
            state.appointments[index] = {
                ...state.appointments[index],
                ...formData,
                serviceName: service.name,
                price: service.price,
            };
        }
    } else {
        // Создание новой записи
        const service = state.services.find((s) => s.id === formData.serviceId);
        state.appointments.push({
            id: Date.now(),
            ...formData,
            serviceName: service.name,
            price: service.price,
        });
    }

    // Закрываем форму и обновляем таблицу
    document.getElementById("add-modal").style.display = "none";
    state.currentEditId = null;
    renderAppointmentsTable();
}

// Вспомогательные функции
function formatDate(date) {
    return date.toISOString().split("T")[0];
}
