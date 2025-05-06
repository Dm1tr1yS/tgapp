document.addEventListener("DOMContentLoaded", function () {
    // Конфигурация
    const config = {
        workStart: 9, // 9:00
        workEnd: 21, // 21:00
        slotDuration: 60, // 60 минут
        visibleDays: 7, // Количество отображаемых дней
        timeFormat: "24h", // Формат времени (12h или 24h)
    };

    // Данные записей (в реальном приложении будут загружаться с сервера)
    let appointments =
        JSON.parse(localStorage.getItem("manicureAppointments")) || [];

    // DOM элементы
    const timeSlotsContainer = document.querySelector(".time-slots");
    const datesHeaderContainer = document.querySelector(".dates-header");
    const appointmentsGridContainer =
        document.querySelector(".appointments-grid");
    const addAppointmentBtn = document.getElementById("addAppointmentBtn");
    const modal = document.getElementById("appointmentModal");
    const closeBtn = document.querySelector(".close-btn");
    const appointmentForm = document.getElementById("appointmentForm");
    const deleteBtn = document.getElementById("deleteBtn");
    const timeSelect = document.getElementById("appointmentTime");
    const modalTitle = document.getElementById("modalTitle");

    // Текущая редактируемая запись
    let currentEditingAppointment = null;

    // Инициализация календаря
    function initCalendar() {
        generateTimeSlots();
        generateDatesHeader();
        generateAppointmentsGrid();
        renderAppointments();
    }

    // Генерация временных слотов
    function generateTimeSlots() {
        timeSlotsContainer.innerHTML = "";

        for (let hour = config.workStart; hour < config.workEnd; hour++) {
            const timeSlot = document.createElement("div");
            timeSlot.className = "time-slot";

            const timeString = formatTime(hour * 60);
            timeSlot.textContent = timeString;

            timeSlotsContainer.appendChild(timeSlot);
        }
    }

    // Генерация заголовков с датами
    function generateDatesHeader() {
        datesHeaderContainer.innerHTML = "";

        const daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
        const today = new Date();

        for (let i = 0; i < config.visibleDays; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const dateHeader = document.createElement("div");
            dateHeader.className = "date-header";

            const dayElement = document.createElement("div");
            dayElement.className = "date-day";
            dayElement.textContent = daysOfWeek[date.getDay()];

            const numberElement = document.createElement("div");
            numberElement.className = "date-number";
            numberElement.textContent = date.getDate();

            // Выделяем текущий день
            if (i === 0) {
                dateHeader.style.backgroundColor = "var(--light-color)";
                dayElement.style.fontWeight = "bold";
                numberElement.style.fontWeight = "bold";
            }

            dateHeader.appendChild(dayElement);
            dateHeader.appendChild(numberElement);
            datesHeaderContainer.appendChild(dateHeader);
        }
    }

    // Генерация сетки для записей
    function generateAppointmentsGrid() {
        appointmentsGridContainer.innerHTML = "";

        // Создаем колонки для каждого дня
        for (let i = 0; i < config.visibleDays; i++) {
            const timeColumn = document.createElement("div");
            timeColumn.className = "time-column-appointments";

            // Создаем ячейки для каждого временного слота
            for (let hour = config.workStart; hour < config.workEnd; hour++) {
                const appointmentSlot = document.createElement("div");
                appointmentSlot.className = "appointment-slot";

                // Добавляем атрибуты для идентификации даты и времени
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dateString = formatDate(date);

                appointmentSlot.dataset.date = dateString;
                appointmentSlot.dataset.time = formatTime(hour * 60);

                // Обработчик клика для создания/просмотра записи
                appointmentSlot.addEventListener("click", function () {
                    handleAppointmentSlotClick(this);
                });

                timeColumn.appendChild(appointmentSlot);
            }

            appointmentsGridContainer.appendChild(timeColumn);
        }
    }

    // Отображение существующих записей
    function renderAppointments() {
        // Очищаем все ячейки
        document.querySelectorAll(".appointment-slot").forEach((slot) => {
            slot.innerHTML = "";
        });

        // Добавляем записи в соответствующие ячейки
        appointments.forEach((appointment) => {
            const slot = findAppointmentSlot(
                appointment.date,
                appointment.time
            );
            if (slot) {
                const appointmentElement =
                    createAppointmentElement(appointment);
                slot.appendChild(appointmentElement);
            }
        });
    }

    // Поиск ячейки по дате и времени
    function findAppointmentSlot(date, time) {
        return document.querySelector(
            `.appointment-slot[data-date="${date}"][data-time="${time}"]`
        );
    }

    // Создание элемента записи
    function createAppointmentElement(appointment) {
        const element = document.createElement("div");
        element.className = "appointment";
        element.dataset.id = appointment.id;

        const nameElement = document.createElement("p");
        nameElement.className = "client-name";
        nameElement.textContent = appointment.clientName;

        const serviceElement = document.createElement("p");
        serviceElement.textContent = appointment.serviceType;

        const phoneElement = document.createElement("p");
        phoneElement.textContent = appointment.clientPhone;

        element.appendChild(nameElement);
        element.appendChild(serviceElement);
        element.appendChild(phoneElement);

        return element;
    }

    // Обработчик клика по ячейке записи
    function handleAppointmentSlotClick(slot) {
        const appointmentId = slot.querySelector(".appointment")?.dataset.id;

        if (appointmentId) {
            // Показываем существующую запись
            showAppointmentDetails(appointmentId);
        } else {
            // Создаем новую запись
            createNewAppointment(slot);
        }
    }

    // Показать детали записи
    function showAppointmentDetails(appointmentId) {
        const appointment = appointments.find((a) => a.id === appointmentId);
        if (!appointment) return;

        currentEditingAppointment = appointment;

        // Заполняем форму данными
        document.getElementById("clientName").value = appointment.clientName;
        document.getElementById("clientPhone").value = appointment.clientPhone;
        document.getElementById("serviceType").value = appointment.serviceType;
        document.getElementById("appointmentDate").value = appointment.date;

        // Заполняем выпадающий список времени
        populateTimeSelect(appointment.date);
        document.getElementById("appointmentTime").value = appointment.time;

        // Показываем кнопку удаления
        deleteBtn.style.display = "block";
        modalTitle.textContent = "Редактировать запись";

        // Показываем модальное окно
        modal.style.display = "block";
    }

    // Создать новую запись
    function createNewAppointment(slot) {
        currentEditingAppointment = null;

        // Очищаем форму
        appointmentForm.reset();

        // Устанавливаем дату и время из ячейки
        const dateInput = document.getElementById("appointmentDate");
        dateInput.value = slot.dataset.date;

        // Заполняем выпадающий список времени
        populateTimeSelect(slot.dataset.date);
        document.getElementById("appointmentTime").value = slot.dataset.time;

        // Скрываем кнопку удаления
        deleteBtn.style.display = "none";
        modalTitle.textContent = "Новая запись";

        // Показываем модальное окно
        modal.style.display = "block";
    }

    // Заполнить выпадающий список времени
    function populateTimeSelect(date) {
        timeSelect.innerHTML = "";

        // Получаем все записи на выбранную дату
        const dateAppointments = appointments.filter((a) => a.date === date);

        for (let hour = config.workStart; hour < config.workEnd; hour++) {
            const timeValue = formatTime(hour * 60);

            // Проверяем, свободно ли это время
            const isBooked = dateAppointments.some((a) => a.time === timeValue);

            if (
                !isBooked ||
                (currentEditingAppointment &&
                    currentEditingAppointment.time === timeValue)
            ) {
                const option = document.createElement("option");
                option.value = timeValue;
                option.textContent = timeValue;
                option.disabled =
                    isBooked &&
                    (!currentEditingAppointment ||
                        currentEditingAppointment.time !== timeValue);
                timeSelect.appendChild(option);
            }
        }
    }

    // Форматирование времени (минуты с начала дня в формат HH:MM)
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (config.timeFormat === "12h") {
            const period = hours >= 12 ? "PM" : "AM";
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${mins
                .toString()
                .padStart(2, "0")} ${period}`;
        } else {
            return `${hours.toString().padStart(2, "0")}:${mins
                .toString()
                .padStart(2, "0")}`;
        }
    }

    // Форматирование даты в формат YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // Обработчик отправки формы
    appointmentForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = {
            clientName: document.getElementById("clientName").value,
            clientPhone: document.getElementById("clientPhone").value,
            serviceType: document.getElementById("serviceType").value,
            date: document.getElementById("appointmentDate").value,
            time: document.getElementById("appointmentTime").value,
        };

        if (currentEditingAppointment) {
            // Обновляем существующую запись
            Object.assign(currentEditingAppointment, formData);
        } else {
            // Создаем новую запись
            const newAppointment = {
                id: Date.now().toString(),
                ...formData,
            };
            appointments.push(newAppointment);
        }

        // Сохраняем в localStorage
        localStorage.setItem(
            "manicureAppointments",
            JSON.stringify(appointments)
        );

        // Обновляем отображение
        renderAppointments();

        // Закрываем модальное окно
        modal.style.display = "none";
    });

    // Обработчик удаления записи
    deleteBtn.addEventListener("click", function () {
        if (currentEditingAppointment) {
            if (confirm("Вы уверены, что хотите удалить эту запись?")) {
                // Удаляем запись из массива
                appointments = appointments.filter(
                    (a) => a.id !== currentEditingAppointment.id
                );

                // Сохраняем в localStorage
                localStorage.setItem(
                    "manicureAppointments",
                    JSON.stringify(appointments)
                );

                // Обновляем отображение
                renderAppointments();

                // Закрываем модальное окно
                modal.style.display = "none";
            }
        }
    });

    // Обработчик изменения даты
    document
        .getElementById("appointmentDate")
        .addEventListener("change", function () {
            populateTimeSelect(this.value);
        });

    // Закрытие модального окна
    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // Кнопка добавления новой записи
    addAppointmentBtn.addEventListener("click", function () {
        currentEditingAppointment = null;
        appointmentForm.reset();

        // Устанавливаем сегодняшнюю дату
        const today = formatDate(new Date());
        document.getElementById("appointmentDate").value = today;

        // Заполняем выпадающий список времени
        populateTimeSelect(today);

        // Скрываем кнопку удаления
        deleteBtn.style.display = "none";
        modalTitle.textContent = "Новая запись";

        // Показываем модальное окно
        modal.style.display = "block";
    });

    // Инициализация календаря
    initCalendar();
});
