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
    // Ваши функции
}

document.addEventListener("DOMContentLoaded", initApp);
