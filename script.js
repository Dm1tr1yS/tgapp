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
    if (!container) return;

    // Очищаем контейнер перед рендерингом
    container.innerHTML = "";

    const table = document.createElement("table");
    table.className = "appointments-table";

    // Создаем шапку таблицы
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // Колонка времени
    const timeHeader = document.createElement("th");
    timeHeader.className = "time-column";
    timeHeader.textContent = "Время";
    headerRow.appendChild(timeHeader);

    // Колонки с датами
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
        const dayOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][
            date.getDay()
        ];

        const th = document.createElement("th");
        th.innerHTML = `
            <div class="date-header">
                <div class="date-day">${day}</div>
                <div class="date-weekday">${dayOfWeek}</div>
            </div>
        `;
        headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement("tbody");

    // Строки с временами
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
            const dateStr = `${state.currentDate.getFullYear()}-${String(
                state.currentDate.getMonth() + 1
            ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const appointment = state.appointments.find(
                (a) => a.date === dateStr && a.time === time
            );

            const cell = document.createElement("td");
            cell.className = "appointment-cell";

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
