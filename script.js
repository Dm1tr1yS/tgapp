// Инициализация состояния
const state = {
    currentDate: new Date(),
    appointments: [
        {
            id: 1,
            date: new Date().toISOString().split('T')[0],
            time: '14:00',
            clientName: 'Тестовый клиент',
            serviceName: 'Маникюр',
            price: 1000
        }
    ]
};

// Основные функции
function renderAppointmentsTable() {
    const container = document.getElementById('appointments-table-container');
    if (!container) return;

    let tableHTML = '<table class="appointments-table">...';
    container.innerHTML = tableHTML;
}

function setupEventListeners() {
    document.getElementById('add-appointment').addEventListener('click', () => {
        document.getElementById('add-modal').style.display = 'flex';
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderAppointmentsTable();
    setupEventListeners();
});