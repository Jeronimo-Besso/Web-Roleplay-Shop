import { normasHTML } from '../templates/normasTemplate.js';
import { tiendaHTML } from '../templates/tiendaTemplate.js';
import { mainHTML } from '../templates/mainTemplate..js';
import { renderizarNormasLogic } from './normas.js';
import { renderizarTiendaLogic } from './tienda.js';
import { escribir } from './main.js';

console.log("Estoy vivo");

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedor");
  contenedor.innerHTML = mainHTML;
  escribir();

  // Navegación
  const btnNormas = document.getElementById("normas");
  const btnTienda = document.getElementById("tienda");
  const btnInicio = document.getElementById("inicio");

  if (btnNormas) {
    btnNormas.addEventListener("click", (e) => {
      e.preventDefault();
      contenedor.innerHTML = normasHTML;
      renderizarNormasLogic();
    });
  }

  if (btnTienda) {
    btnTienda.addEventListener("click", (e) => {
      e.preventDefault();
      contenedor.innerHTML = tiendaHTML;
      renderizarTiendaLogic();
    });
  }

  if (btnInicio) {
    btnInicio.addEventListener("click", (e) => {
      e.preventDefault();
      contenedor.innerHTML = mainHTML;
      escribir();
    });
  }
 // 🔒 Verificar sesión con cookies habilitadas
 fetch("http://localhost:5000/api/session", {
  credentials: "include"
})
  .then(res => res.json())
  .then(data => {
    console.log("Sesión recibida:", data);

    const contenedorSteam = document.getElementById("contenedorSteam");
    const avatar = document.getElementById("avatarSteam");
    const nombreSpan = document.getElementById("nombreSteam");
    const loginBtn = document.getElementById("login-btn");

    if (data.logged_in) {
      if (contenedorSteam) contenedorSteam.style.display = "flex";

      if (avatar) {
        avatar.src = data.avatar_url;
        avatar.alt = data.nombre;
        avatar.style.display = "inline-block";        // 🔑 Forzar visibilidad
        avatar.style.width = "40px";                  // 🔒 Seguridad en tamaño
        avatar.style.height = "40px";
      }

      if (nombreSpan) nombreSpan.textContent = data.nombre;
      if (loginBtn) loginBtn.style.display = "none";
    } else {
      if (contenedorSteam) contenedorSteam.style.display = "none";
      if (loginBtn) loginBtn.style.display = "inline-block";
    }
  })
  .catch(err => console.error("❌ Error al obtener sesión:", err));


});


// agregar a link para q funcione tema sessions y login http://localhost:5500/Frontend/templates/index.html