let carrito = []; // Aquí guardamos TODOS los productos, no solo un contador

const panelCarrito = document.getElementById('panel-carrito');
const listaCarrito = document.getElementById('lista-carrito');
const totalCarritoTexto = document.getElementById('total-carrito');
const iconoCarrito = document.getElementById('abrir-carrito');
const cerrarCarrito = document.getElementById('cerrar-carrito');

function agregarAlCarrito(boton) {
    const card = boton.closest('.card');
    const nombre = card.querySelector('h3').textContent;
    const precioTexto = card.querySelector('.precio').textContent;
    const precioNumero = Number(precioTexto.replace('$', '').replace(/\./g, ''));

    // ¿Ya existe este producto en el carrito? Si sí, solo le subimos la cantidad
    const existente = carrito.find(item => item.nombre === nombre);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ nombre: nombre, precio: precioNumero, cantidad: 1 });
    }

    renderizarCarrito();
}

function quitarDelCarrito(nombre) {
    const existente = carrito.find(item => item.nombre === nombre);

    if (existente.cantidad > 1) {
        existente.cantidad--;
    } else {
        // Si solo queda 1, lo eliminamos completamente del array
        carrito = carrito.filter(item => item.nombre !== nombre);
    }

    renderizarCarrito();
}

// Esta función "dibuja" el carrito completo cada vez que algo cambia
function renderizarCarrito() {
    listaCarrito.innerHTML = ''; // Limpiamos la lista antes de volver a pintarla
    let totalProductos = 0;
    let totalPrecio = 0;

    carrito.forEach(function (item) {
        totalProductos += item.cantidad;
        totalPrecio += item.precio * item.cantidad;

        const div = document.createElement('div');
        div.className = 'item-carrito';
        div.innerHTML = `
            <span>${item.nombre} x${item.cantidad}</span>
            <span>
                $${(item.precio * item.cantidad).toLocaleString('es-CO')}
                <button class="quitar-item" data-nombre="${item.nombre}">✕</button>
            </span>
        `;
        listaCarrito.appendChild(div);
    });

    document.getElementById('contador-carrito').textContent = totalProductos;
    totalCarritoTexto.textContent = '$' + totalPrecio.toLocaleString('es-CO');

    // Conectamos el botón "✕" de cada producto para quitarlo
    document.querySelectorAll('.quitar-item').forEach(function (btn) {
        btn.addEventListener('click', function () {
            quitarDelCarrito(btn.dataset.nombre);
        });
    });
}

function activarBotonesCarrito() {
    const botones = document.querySelectorAll('.card button');
    botones.forEach(function (boton) {
        boton.addEventListener('click', function () {
            agregarAlCarrito(boton);
        });
    });
}

document.addEventListener('productos-cargados', activarBotonesCarrito);
activarBotonesCarrito();

iconoCarrito.addEventListener('click', function () {
    panelCarrito.classList.remove('oculto');
});

cerrarCarrito.addEventListener('click', function () {
    panelCarrito.classList.add('oculto');
});
document.getElementById('btn-finalizar').addEventListener('click', async function () {
    const nombre = document.getElementById('input-nombre').value.trim();
    const telefono = document.getElementById('input-telefono').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const direccion = document.getElementById('input-direccion').value.trim();
    const metodoEntrega = document.querySelector('input[name="entrega"]:checked').value;
    const mensaje = document.getElementById('mensaje-checkout');

    // Validaciones básicas antes de enviar
    if (carrito.length === 0) {
        mensaje.textContent = 'Tu carrito está vacío.';
        mensaje.className = 'error';
        return;
    }

    if (!nombre || !telefono) {
        mensaje.textContent = 'Por favor completa tu nombre y teléfono.';
        mensaje.className = 'error';
        return;
    }

    if (metodoEntrega === 'domicilio' && !direccion) {
        mensaje.textContent = 'Por favor escribe tu dirección de entrega.';
        mensaje.className = 'error';
        return;
    }

    const totalPrecio = carrito.reduce((suma, item) => suma + (item.precio * item.cantidad), 0);

    const boton = document.getElementById('btn-finalizar');
     boton.disabled = true;

    // Guardamos la orden en Supabase
        const { data, error } = await supabaseClient
        .from('ordenes')
        .insert([
            {
                cliente_nombre: nombre,
                cliente_telefono: telefono,
                cliente_email: email || null,
                productos: carrito,
                total: totalPrecio,
                estado: 'pendiente',
                metodo_entrega: metodoEntrega,
                direccion: metodoEntrega === 'domicilio' ? direccion : null
            }
        ]);

    if (error) {
        console.error('Error guardando la orden:', error);
        mensaje.textContent = 'Hubo un error, intenta de nuevo.';
        mensaje.className = 'error';
        boton.disabled = false;
        return;
    }

    mensaje.textContent = '¡Pedido recibido! Te contactaremos pronto.';
    mensaje.className = 'exito';

    // Vaciamos el carrito después de la compra exitosa
    carrito = [];
    renderizarCarrito();
    document.getElementById('input-nombre').value = '';
    document.getElementById('input-telefono').value = '';
    document.getElementById('input-email').value = '';
    document.getElementById('input-direccion').value = '';
    boton.disabled = false;
});
// Mostrar/ocultar el campo de dirección según el método de entrega elegido
const inputDireccion = document.getElementById('input-direccion');

document.querySelectorAll('input[name="entrega"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
        if (radio.value === 'recoger' && radio.checked) {
            inputDireccion.style.display = 'none';
            inputDireccion.value = '';
        } else if (radio.value === 'domicilio' && radio.checked) {
            inputDireccion.style.display = 'block';
        }
    });
});
