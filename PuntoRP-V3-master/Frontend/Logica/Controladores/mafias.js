document.getElementById('cargar_mafias_form').addEventListener('click', async function (event) {
    event.preventDefault();

    const contenedor = document.getElementById('contenedorFormulario');
    contenedor.innerHTML = "";

    const formHTML = `<form id="mafias_form" class="form-estetico">
  <label for="nombre">Nombre:</label>
  <input type="text" id="nombre" name="nombre" required>

  <label for="precio">Precio:</label>
  <input type="number" id="precio" name="precio" required>

  <label for="detalle">Detalles:</label>
  <input type="text" id="detalle" name="detalle" required>

  <button type="submit">Agregar Mafia</button>
</form>`;
    contenedor.innerHTML = formHTML;

    document.getElementById('mafias_form').addEventListener('submit', async function (event) {
        event.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const precio = document.getElementById('precio').value;
        const detalle = document.getElementById('detalle').value;
        console.log("Datos a enviar:", { nombre, precio, detalle });

        const response = await fetch("http://127.0.0.1:5000/crear_mafia", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre,
                precio,
                detalle
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error("Error al obtener response de la API", data);
        } else {
            return console.log('Respuesta:', data);
        }
    });
});

document.getElementById('eliminar_mafias_form').addEventListener('click', async function (event) {
    event.preventDefault();

    const contenedor = document.getElementById('contenedorFormulario');
    contenedor.innerHTML = "";

    const response = await fetch("http://127.0.0.1:5000/get_all_mafias", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        return console.log(response);
    }

    const data = await response.json();
    console.log('RESPUESTA BACK',data)

    data.forEach(element => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="card-mafia">
  <span>Nombre: ${element.nombre}</span>
  <span>Precio: ${element.precio}</span>
  <span>Detalles: ${element.detalles}</span>
  <button class="boton-eliminarMafia" data-nombre="${element.nombre}">Eliminar</button>
</div>`;
        contenedor.appendChild(div);
    });
});

document.getElementById('contenedorFormulario').addEventListener('click', async function (event) {
    if (event.target.classList.contains('boton-eliminarMafia')) {
        event.preventDefault();

        const nombre = event.target.getAttribute('data-nombre');

        if (!confirm(`¿Querés eliminar la mafia "${nombre}"?`)) return;

        const response = await fetch("http://127.0.0.1:5000/eliminar_mafia", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre })
        });

        const data = await response.json();

        if (!response.ok) {
            return alert(data.error || 'Error al eliminar mafia');
        }

        alert(data.mensaje || 'Mafia eliminada con éxito');
        // 🔁 Recargar la lista de mafias
        document.getElementById('eliminar_mafias_form').click();
    }
});
