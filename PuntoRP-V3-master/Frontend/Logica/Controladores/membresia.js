// Cargar formulario para agregar membresías
document.getElementById('cargar_membresias_form').addEventListener('click', function () {
    const formHTML = `
        <form id="membresias_form" class="form-estetico">
  <label for="nombre">Nombre:</label>
  <input type="text" id="nombre" name="nombre" required>

  <label for="precio">Precio:</label>
  <input type="number" id="precio" name="precio" required>

  <label for="detalles">Detalle:</label>
  <input type="text" id="detalles" name="detalles" required>            

  <button type="submit">Agregar Membresías</button>
</form>
    `;
    document.getElementById('contenedorFormulario').innerHTML = formHTML;

    document.getElementById('membresias_form').addEventListener('submit', async function (event) {
        event.preventDefault();

        const response = await fetch("http://127.0.0.1:5000/crear_membresia", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: document.getElementById('nombre').value,
                precio: document.getElementById('precio').value,
                detalles: document.getElementById('detalles').value
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.exito || 'Membresía agregada con éxito');
            document.getElementById('contenedorFormulario').innerHTML = '';
            await cargarMembresias();  // para recargar la lista si querés mostrarla luego
        } else {
            alert(data.error || 'Error al agregar la membresía');
        }
    });
});

// Cargar todas las membresías y mostrarlas con botón eliminar
document.getElementById('eliminar_membresias_form').addEventListener('click', async function (event) {
    event.preventDefault();
    await cargarMembresias();
});

async function cargarMembresias() {
    const contenedor = document.getElementById('contenedorFormulario');
    const response = await fetch("http://127.0.0.1:5000/get_all_membresias", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        return alert('Error al obtener membresías');
    }

    const membresias = await response.json();
    contenedor.innerHTML = '';

    membresias.forEach(element => {
        const div = document.createElement("div");
        div.innerHTML = `
            <div class="card-generica">
  <span><strong>Nombre:</strong> ${element.nombre}</span>
  <span><strong>Precio:</strong> $${element.precio}</span>
  <span><strong>Detalles:</strong> ${element.detalles}</span>
  <button class="boton-eliminar" data-nombre="${element.nombre}">Eliminar</button>
</div>`;
        contenedor.appendChild(div);
    });
}

// Delegación de eventos para eliminar membresía
document.getElementById('contenedorFormulario').addEventListener('click', async function (event) {
    if (event.target.classList.contains('boton-eliminar')) {
        event.preventDefault();
        const nombre = event.target.getAttribute('data-nombre');

        if (!confirm(`¿Querés eliminar la membresía "${nombre}"?`)) return;

        const response = await fetch("http://127.0.0.1:5000/eliminar_membresia", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre })
        });

        const data = await response.json();

        if (!response.ok) {
            return alert(data.error || 'Error al eliminar membresía');
        }

        alert(data.mensaje || 'Membresía eliminada con éxito');
        await cargarMembresias();  // Recarga la lista actualizada
    }
});
