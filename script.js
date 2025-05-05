// Проверка загрузки
console.log("Script initialized");

const state = {
    currentDate: new Date(),
    appointments: [
        {
            id: 1,
            date: new Date().toISOString().split("T")[0],
            time: "14:00",
            clientName: "Тест",
            serviceName: "Маникюр",
            price: 1000,
        },
    ],
};

function initApp() {
    console.log("App initialized");
    // Основные функции
    function renderAppointmentsTable() {
        const container = document.getElementById(
            "appointments-table-container"
        );
        if (!container) return;

        let tableHTML = '<table class="appointments-table">...';
        container.innerHTML = tableHTML;
    }

    function setupEventListeners() {
        document
            .getElementById("add-appointment")
            .addEventListener("click", () => {
                document.getElementById("add-modal").style.display = "flex";
            });
    }
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    renderAppointmentsTable();
    setupEventListeners();
});

document.addEventListener("DOMContentLoaded", initApp);
