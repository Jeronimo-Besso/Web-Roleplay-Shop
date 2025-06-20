document.getElementById('cargar_coins_formulario').addEventListener('click',async function(event){
    event.preventDefault()


    const formHTML = `
        <form id="coins_form" class="form-estetico">
    <label for="precio">Precio:</label>
    <input type="number" id="precio" name="precio" required>

    <label for="cantidad">Cantidad:</label>
    <input type="text" id="cantidad" name="cantidad" required>

    <button type="submit">Agregar Coins</button>
  </form>`
    document.getElementById('contenedorFormulario').innerHTML = formHTML;
    //ahi ya muestra el formulario


    //agregamos esta que es el boton del form
    document.getElementById('coins_form').addEventListener('submit', async function(event) {
        event.preventDefault();
        response = await fetch("http://127.0.0.1:5000/crear_coins", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                            precio: document.getElementById('precio').value,
                            cantidad:document.getElementById('cantidad').value
                        })})
        const data = await response.json()
        if (!response.ok){
            console.log(data)
        }
        else{
            console.log(data)
        }
        })})

document.getElementById('eliminar_coins_form').addEventListener('click',async function(event){
    event.preventDefault();
    contenedor = document.getElementById('contenedorFormulario');
    contenedor.innerHTML = "";
    //vacio el contenedor
    response = await fetch("http://127.0.0.1:5000/get_all_coins", { 
                method: 'GET',
                headers: {'Content-Type': 'application/json'}}) //no lleva body porque no es un POST
    if(!response.ok){
        return console.log(response)}
    else{
        const data = await response.json()
        data.forEach(element => {
            div = document.createElement('div')
            div.innerHTML = `<div class="card-generica">
  <span><strong>Precio:</strong> $${element.precio}</span>
  <span><strong>Cantidad:</strong> ${element.cantidad}</span>
  <button class="boton-eliminarCoin" data-cantidad="${element.cantidad}">Eliminar</button>
</div>
            `
            contenedor.appendChild(div)
        });
    }


})

document.getElementById('contenedorFormulario').addEventListener('click', async function (event) {
    if (event.target.classList.contains('boton-eliminarCoin')) {
        event.preventDefault();
        const cantidad = event.target.getAttribute('data-cantidad');

        if (!confirm(`¿Querés eliminar la membresía "${cantidad}"?`)) return;

        const response = await fetch("http://127.0.0.1:5000/eliminar_coins", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad: cantidad })
        });

        const data = await response.json();

        if (!response.ok) {
            return alert(data.error || 'Error al eliminar Coin');
        }

        alert(data.mensaje || 'Coin eliminada con éxito')
        actualizar()
    }
});

async function actualizar(){
    contenedor = document.getElementById('contenedorFormulario');
    contenedor.innerHTML = ''
    response = await fetch("http://127.0.0.1:5000/get_all_coins", { 
                method: 'GET',
                headers: {'Content-Type': 'application/json'}}) //no lleva body porque no es un POST
    if(!response.ok){
        return console.log(response)}
    else{
        const data = await response.json()
        data.forEach(element => {
            div = document.createElement('div')
            div.innerHTML = `<div style="width:100%;height:100%;margin:auto;background-color:grey;border:white 1px solid;border-radius:5px;display:flex;flex-direction:column;color:white;justify-content:center;align-items:center;">
            
            <span>Precio: ${element.precio}</span><span>Cantidad: ${element.cantidad}</span>
            <button class="boton-eliminarCoin" data-cantidad="${element.cantidad}">Eliminar</button>
            `
            contenedor.appendChild(div)})
            
}}