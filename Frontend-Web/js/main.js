document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.rating input').forEach(input => {
        input.addEventListener('change', () => {
        document.getElementById('prioridad-valor').textContent = actualizarValuePrioridad(input.value);
        });
    });
  
    const form = document.querySelector("form");
    form.addEventListener("submit", async (event) => {
        
        event.preventDefault(); 
        const formData = new FormData(form);
        const incidencia = {
            id: null,         
            usuario: formData.get("usuario"),       
            clase: formData.get("clase"),           
            tipo: parseInt(formData.get("tipo")),               
            incidencia: formData.get("incidencia"), 
            prioridad: parseInt(formData.get("prioridad")),     
            estado: 0               
        };
        await addIncidencia(incidencia);
        form.reset(); 
        document.getElementById('prioridad-valor').textContent = "";
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

async function addIncidencia(incidencia) {
  const API_URL = "http://127.0.0.1:8000/incidencias";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incidencia)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Incidencia guardada correctamente:", data);

    mostrarPopup(data);

  } catch (error) {
    console.error("❌ Error al guardar la incidencia:", error.message);
    alert("No se pudo guardar la incidencia. Intenta nuevamente.");
  }
}

function mostrarPopup(data) {
  const popup = document.getElementById("popup");
  const info = document.getElementById("popup-info");

  info.textContent = JSON.stringify(data, null, 2);
  popup.style.display = "flex";

  setTimeout(() => {
    cerrarPopup();
  }, 8000);
}

function cerrarPopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "none";
}
