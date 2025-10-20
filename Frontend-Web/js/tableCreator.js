let listaIncidencias;

document.addEventListener("DOMContentLoaded", async () => {
  const h1 = document.querySelector(".content h1");

  if (h1) {
    let modoActual;
    const titulo = h1.textContent.trim();

    switch (titulo) {
      case "Incidencias abiertas":
        modoActual = 0;
        console.log("Se abre incidencias abiertas");
        break;

      case "Incidencias en curso":
        modoActual = 1;
        console.log("Se abre incidencias en curso");
        break; 

      case "Incidencias cerradas":
        modoActual = 2;
        console.log("Se abre incidencias cerradas");
        break;
  
      default:
        modoActual = "desconocido";
        console.warn("Título no reconocido:", titulo);
    }

    listaIncidencias = await obtenerIncidenciasPorEstado(modoActual);
    mostrarTablaIncidencias(listaIncidencias);

    console.log("Modo actual:", modoActual);
  } else {
    console.error("No se encontró ningún <h1> dentro de .content");
  }
});

async function obtenerIncidenciasPorEstado(estado) {
  try {
    const respuesta = await fetch(`http://localhost:8000/incidencias/estado/${estado}`);

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
    }

    const datos = await respuesta.json();
    const incidencias = Array.isArray(datos) ? datos : [];
    console.log("Incidencias obtenidas:", incidencias);

    return incidencias;
  } catch (error) {
    console.error("Error al obtener incidencias:", error.message);
    return [];
  }
}

async function obtenerIncidenciasPorEstado(estado) {
  try {
    const respuesta = await fetch(`http://localhost:8000/incidencias/estado/${estado}`);

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
    }

    const datos = await respuesta.json();
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    console.error("Error al obtener incidencias:", error.message);
    return [];
  }
}

function mostrarTablaIncidencias(incidencias) {
  const contenedor = document.getElementById("tabla-incidencias");
  contenedor.innerHTML = "";

  if (incidencias.length === 0) {
    contenedor.innerHTML = "<h2>No se encontraron incidencias con ese estado.</h2>";
    return;
  }

  const tabla = document.createElement("table");
  tabla.classList.add("tabla-incidencias");

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Usuario</th>
      <th>Clase</th>
      <th>Tipo</th>
      <th>Incidencia</th>
      <th>Prioridad</th>
    </tr>
  `;
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");

  incidencias.forEach(inc => {
    const fila = document.createElement("tr");
    const tipo = inc.tipo === 0 ? "Informática" : inc.tipo === 1 ? "Mantenimiento" : "desconocido;";
    const prioridad = inc.prioridad === 0 ? "Baja" : inc.prioridad === 1 ? "Normal" : inc.prioridad === 2 ? "Alta" : inc.prioridad === 3 ? "Urgente" : inc.prioridad === 4 ? "Evento canonico" : "desconocido"; 

    fila.innerHTML = `
      <td>${inc.usuario}</td>
      <td>${inc.clase}</td>
      <td>${tipo}</td>
      <td>${inc.incidencia}</td>
      <td>${prioridad}</td>
    `;

    tbody.appendChild(fila);
  });

  tabla.appendChild(tbody);
  contenedor.appendChild(tabla);
}

