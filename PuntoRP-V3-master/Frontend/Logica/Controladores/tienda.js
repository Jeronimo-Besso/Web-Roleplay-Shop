export function renderizarTiendaLogic() {
  const contenedorProductos = document.getElementById('contenedor-productos');

  const mostrarCargando = () => {
    contenedorProductos.innerHTML = '<p class="cargando">Cargando productos...</p>';
  };

  const cargarProductos = async (endpoint, renderPlantilla) => {
    mostrarCargando();
    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        alert(`Error al obtener ${endpoint}`);
        return;
      }
      const data = await response.json();
      contenedorProductos.innerHTML = '';
      data.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = renderPlantilla(item);
        contenedorProductos.appendChild(div);
      });

      agregarEventosDeCompra(); // ¡Importante!
    } catch (error) {
      console.error('❌ Error en fetch:', error);
      contenedorProductos.innerHTML = '<p class="error">Ocurrió un error al cargar los productos.</p>';
    }
  };

  const plantillaGenerica = (nombre, precio, detalles, tipo = "container", imagen = null) => {
    if (tipo === "vehiculo") {
      return `
        <div class="card">
          <div class="image_container">
            <img src="/static/imgs/${imagen}" alt="${nombre}" class="image" />
          </div>
          <div class="title">
            <span class="nombre">${nombre}</span><br>
            <span class="price">$${precio}</span><br>
            <span class="description">${detalles}</span>
          </div>
          <button class="cart-button">Comprar</button>
        </div>`;
    }

    return `
      <div class="container">
        <p class="title">${nombre}</p>
        <p class="price">$${precio}</p>
        ${detalles ? `<p class="description">${detalles}</p>` : ""}
        <a class="subscribe-button" href="#">Comprar</a>
      </div>`;
  };

  // Eventos por categoría
  document.getElementById('membresias').addEventListener('click', () => {
    cargarProductos('get_all_membresias', m => plantillaGenerica(m.nombre, m.precio, m.detalles));
  });

  document.getElementById('mafias').addEventListener('click', () => {
    cargarProductos('get_all_mafias', m => plantillaGenerica(m.nombre, m.precio, m.detalles));
  });

  document.getElementById('vehiculos').addEventListener('click', () => {
    cargarProductos('get_all_vehiculos', v => plantillaGenerica(v.nombre, v.precio, v.detalles, "vehiculo", v.vehiculo_img));
  });

  document.getElementById('coins').addEventListener('click', () => {
    cargarProductos('get_all_coins', c => plantillaGenerica(`${c.cantidad} Coins`, c.precio));
  });

  // Evento de compra
  const agregarEventosDeCompra = () => {
    const botones = document.querySelectorAll('.subscribe-button, .cart-button');
    botones.forEach(boton => {
      boton.addEventListener('click', async (e) => {
        e.preventDefault();
        const card = e.target.closest('.container, .card');
        const nombre = card.querySelector('.title, .nombre')?.innerText.trim() || "Producto";
        const precioTexto = card.querySelector('.price')?.innerText.replace('$', '').trim() || "0";
        const precio = parseFloat(precioTexto.replace(',', '.'));

        try {
          alert("⏳ Redirigiendo al pago...");
          const res = await fetch("http://localhost:5000/crear_pago", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, precio })
          });

          const data = await res.json();
          if (data.init_point) {
            window.location.href = data.init_point;
          } else {
            alert("⚠️ No se pudo generar el pago");
            console.error(data);
          }
        } catch (err) {
          console.error("❌ Error al crear la preferencia:", err);
          alert("Hubo un error al procesar tu compra.");
        }
      });
    });
  };
}
