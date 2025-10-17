document.querySelectorAll('.rating input').forEach(input => {
    input.addEventListener('change', () => {
    document.getElementById('prioridad-valor').textContent = actualizarValuePrioridad(input.value);
    });
});

function actualizarValuePrioridad(value) {
    const numericValue = parseInt(value);
    switch (numericValue) {
        case 0:
            return "Baja";
        case 1:
            return "Normal";
        case 2:
            return "Alta";
        case 3:
            return "Urgente";
        case 4:
            return "Evento canonico";
        default:
            return "";
    }
}