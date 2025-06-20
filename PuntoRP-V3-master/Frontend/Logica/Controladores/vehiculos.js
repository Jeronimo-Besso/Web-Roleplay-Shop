document.getElementById('cargar_vehiculos_form').addEventListener('click',async function(event){
event.preventDefault()

    contenedor = document.getElementById('contenedorFormulario');
    contenedor.innerHTML = "";

    const formHTML = `
  <form id="vehiculos_form" class="form-estetico">
    <label for="nombre">Nombre:</label>
    <input type="text" id="nombre" name="nombre" required>

    <label for="precio">Precio:</label>
    <input type="number" id="precio" name="precio" required>

    <label for="detalle">Detalles:</label>
    <input type="text" id="detalle" name="detalle" required>

    <label for="vehiculo_img">Imagen Vehículo:</label>
    <input type="file" id="vehiculo_img" name="vehiculo_img" accept="image/*" required>

    <button type="submit">Agregar Vehículo</button>
  </form>
`
    contenedor.innerHTML = formHTML

    document.getElementById('vehiculos_form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);  // Recoge todos los campos del formulario, incluyendo la imagen

    try {
        const response = await fetch("http://127.0.0.1:5000/crear_vehiculo", {
            method: 'POST',
            body: formData  // Sin headers, el navegador se encarga
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error al obtener response de la API");
        } else {
            console.log('Vehículo creado:', data);
            alert("Vehículo creado con éxito");
        }

    } catch (err) {
        console.error('Error al enviar los datos:', err);
        alert("Error: " + err.message);
    }
});
})

document.getElementById('eliminar_vehiculos_form').addEventListener('click', async function (event) {
    event.preventDefault();
    
    const contenedor = document.getElementById('contenedorFormulario');
    contenedor.innerHTML = "";

    const response = await fetch("http://127.0.0.1:5000/get_all_vehiculos", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        return console.log(response);
    }

    const data = await response.json();

    data.forEach(element => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="card-vehiculo">
  <span><strong>Nombre:</strong> ${element.nombre}</span>
  <span><strong>Precio:</strong> $${element.precio}</span>
  <span><strong>Detalles:</strong> ${element.detalles}</span>

  <button class="boton-eliminarVehiculo" data-nombre="${element.nombre}">
    Eliminar
  </button>
</div>`;
        contenedor.appendChild(div);
    });
});

// Delegación de eventos para manejar el click en botones "Eliminar"
document.getElementById('contenedorFormulario').addEventListener('click', async function (event) {
    if (event.target.classList.contains('boton-eliminarVehiculo')) {
        event.preventDefault();

        const nombre = event.target.getAttribute('data-nombre');

        if (!confirm(`¿Querés eliminar el vehículo "${nombre}"?`)) return;

        const response = await fetch("http://127.0.0.1:5000/eliminar_vehiculo", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre })
        });

        const data = await response.json();

        if (!response.ok) {
            return alert(data.error || 'Error al eliminar vehículo');
        }

        alert(data.mensaje || 'Vehículo eliminado con éxito');
        // 🔁 Recargar la lista de vehículos
        document.getElementById('eliminar_vehiculos_form').click();
    }
});
