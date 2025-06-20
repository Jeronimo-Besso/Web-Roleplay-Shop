export function escribir() {
  const palabras = ["Comunidad", "Familia", "Risas", "Amigos"];
  const texto = document.getElementById("palabra-dinamica");
  let palabraIndex = 0;
  let letraIndex = 0;
  let borrando = false;

  function animar() {
    if (!texto) return;

    const palabra = palabras[palabraIndex];

    if (!borrando) {
      texto.textContent = palabra.slice(0, letraIndex++);
      if (letraIndex > palabra.length) {
        borrando = true;
        setTimeout(animar, 1000);
        return;
      }
    } else {
      texto.textContent = palabra.slice(0, letraIndex--);
      if (letraIndex < 0) {
        palabraIndex = (palabraIndex + 1) % palabras.length;
        borrando = false;
        letraIndex = 0;
        setTimeout(animar, 200);
        return;
      }
    }

    setTimeout(animar, borrando ? 50 : 100);
  }

  animar();
}
