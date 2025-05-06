// Состояние приложения
const state = {
    currentDate: new Date(),
    appointments: [
        {
            id: 1,
            date: new Date().toISOString().split("T")[0],
            time: "14:00",
            clientName: "Анна Иванова",
            clientPhone: "+79161234567",
            serviceId: 2,
            serviceName: "Покрытие гель-лак",
            price: 1500,
            notes: "Цвет: красный",
        },
    ],
    services: [
        { id: 1, name: "Классический маникюр", price: 1000 },
        { id: 2, name: "Покрытие гель-лак", price: 1500 },
        { id: 3, name: "Наращивание ногтей", price: 2500 },
    ],
    editingAppointment: null,
    editMode: false,
};

// Инициализация приложения
document.addEventListener("DOMContentLoaded", () => {
    // Проверка загрузки
    console.log("Приложение инициализировано");

    // Инициализация Telegram WebApp
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.expand();
        console.log("Telegram WebApp инициализирован");
    }

    renderAppointmentsTable();
    setupEventListeners();
});

function renderAppointmentsTable() {
    const container = document.getElementById("appointments-table-container");
    if (!container) {
        console.error("Error: Table container not found");
        return;
    }

    // Очищаем контейнер
    container.innerHTML = "";

    // Создаем элементы через DOM API для надежности
    const table = document.createElement("table");
    table.className = "appointments-table";

    // Шапка таблицы
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // Колонка времени
    const timeHeader = document.createElement("th");
    timeHeader.className = "time-column";
    timeHeader.textContent = "Время";
    headerRow.appendChild(timeHeader);

    // Добавляем даты в шапку
    const daysInMonth = new Date(
        state.currentDate.getFullYear(),
        state.currentDate.getMonth() + 1,
        0
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const th = document.createElement("th");
        th.innerHTML = `
            <div class="date-header">
                <div class="date-day">${day}</div>
                <div class="date-weekday">
                    ${
                        ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][
                            new Date(
                                state.currentDate.getFullYear(),
                                state.currentDate.getMonth(),
                                day
                            ).getDay()
                        ]
                    }
                </div>
            </div>
        `;
        headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement("tbody");

    // Временные слоты (10:00 - 19:00)
    for (let hour = 10; hour <= 19; hour++) {
        const time = `${hour}:00`;
        const row = document.createElement("tr");

        // Ячейка времени
        const timeCell = document.createElement("td");
        timeCell.className = "time-column";
        timeCell.textContent = time;
        row.appendChild(timeCell);

        // Ячейки с записями
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDate(
                new Date(
                    state.currentDate.getFullYear(),
                    state.currentDate.getMonth(),
                    day
                )
            );

            const cell = document.createElement("td");
            cell.className = "appointment-cell";

            // Поиск записи
            const appointment = state.appointments.find(
                (a) => a.date === dateStr && a.time === time
            );

            if (appointment) {
                cell.innerHTML = `
                    <div class="appointment-info">
                        <div class="client-name">${appointment.clientName}</div>
                        <div class="service-name">${appointment.serviceName}</div>
                        <div>${appointment.price} руб.</div>
                    </div>
                `;
            }

            row.appendChild(cell);
        }

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    container.appendChild(table);
    console.log("Table rendered successfully");
}

// Вспомогательная функция
function formatDate(date) {
    return date.toISOString().split("T")[0];
}

function setupEventListeners() {
    // Навигация по месяцам
    document.getElementById("prev-month").addEventListener("click", () => {
        state.currentDate.setMonth(state.currentDate.getMonth() - 1);
        renderAppointmentsTable();
    });

    document.getElementById("next-month").addEventListener("click", () => {
        state.currentDate.setMonth(state.currentDate.getMonth() + 1);
        renderAppointmentsTable();
    });

    // Кнопка добавления записи
    document.getElementById("add-appointment").addEventListener("click", () => {
        document.getElementById("appointment-date").value = new Date()
            .toISOString()
            .split("T")[0];
        document.getElementById("add-modal").style.display = "flex";
    });

    // Кнопка отмены
    document.getElementById("cancel-form").addEventListener("click", () => {
        document.getElementById("add-modal").style.display = "none";
    });

    // Сохранение записи
    document
        .getElementById("save-appointment")
        .addEventListener("click", () => {
            const date = document.getElementById("appointment-date").value;
            const time = document.getElementById("appointment-time").value;
            const clientName = document.getElementById("client-name").value;
            const clientPhone = document.getElementById("client-phone").value;
            const serviceId = parseInt(
                document.getElementById("service").value
            );

            if (!date || !time || !clientName || !clientPhone || !serviceId) {
                alert("Заполните все поля");
                return;
            }

            const service = state.services.find((s) => s.id === serviceId);
            const newAppointment = {
                id: Date.now(),
                date,
                time,
                clientName,
                clientPhone,
                serviceId,
                serviceName: service.name,
                price: service.price,
            };

            state.appointments.push(newAppointment);
            document.getElementById("add-modal").style.display = "none";
            renderAppointmentsTable();
        });
}

// Новая функция для показа кнопки редактирования
function showEditButton(cell, appointment) {
    // Удаляем старую кнопку, если есть
    document
        .querySelectorAll(".edit-btn-container")
        .forEach((el) => el.remove());

    // Создаем контейнер для кнопки
    const btnContainer = document.createElement("div");
    btnContainer.className = "edit-btn-container";

    // Позиционируем относительно ячейки
    const rect = cell.getBoundingClientRect();
    btnContainer.style.position = "absolute";
    btnContainer.style.left = `${rect.left + window.scrollX}px`;
    btnContainer.style.top = `${rect.top + window.scrollY - 40}px`;

    // Создаем кнопку
    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.innerHTML = "✏️ Редактировать";

    editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditModal(appointment);
        btnContainer.remove();
    });

    btnContainer.appendChild(editBtn);
    document.body.appendChild(btnContainer);

    // Закрываем по клику вне кнопки
    const closeHandler = () => {
        btnContainer.remove();
        document.removeEventListener("click", closeHandler);
    };

    setTimeout(() => {
        document.addEventListener("click", closeHandler);
    }, 100);
}

// Функция для открытия модального окна редактирования
function openEditModal(appointment) {
    state.editingAppointment = appointment;
    state.editMode = true;

    // Заполняем форму данными
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

// Обновляем обработчик сохранения
document.getElementById("save-appointment").addEventListener("click", () => {
    const date = document.getElementById("appointment-date").value;
    const time = document.getElementById("appointment-time").value;
    const clientName = document.getElementById("client-name").value;
    const clientPhone = document.getElementById("client-phone").value;
    const serviceId = parseInt(document.getElementById("service").value);
    const notes = document.getElementById("notes").value;

    if (state.editingAppointment) {
        // Редактируем существующую запись
        const service = state.services.find((s) => s.id === serviceId);
        Object.assign(state.editingAppointment, {
            date,
            time,
            clientName,
            clientPhone,
            serviceId,
            serviceName: service.name,
            price: service.price,
            notes,
        });
    } else {
        // Создаем новую запись
        const service = state.services.find((s) => s.id === serviceId);
        const newAppointment = {
            id: Date.now(),
            date,
            time,
            clientName,
            clientPhone,
            serviceId,
            serviceName: service.name,
            price: service.price,
            notes,
        };
        state.appointments.push(newAppointment);
    }

    // Закрываем модальное окно и обновляем таблицу
    document.getElementById("add-modal").style.display = "none";
    state.editingAppointment = null;
    state.editMode = false;
    renderAppointmentsTable();
});

// Обработчик отмены редактирования
document.getElementById("cancel-form").addEventListener("click", () => {
    state.editingAppointment = null;
    state.editMode = false;
    document.getElementById("add-modal").style.display = "none";
});
