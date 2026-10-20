const SUPABASE_URL = 'https://qpvnqtxxzgiokyilbvoj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdm5xdHh4emdpb2t5aWxidm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNDI0NzMsImV4cCI6MjEwNDkxODQ3M30.D3YghsoD_fxvO8mr8xzYCmNvrrsbOLJQ0O_Ns3UBCio';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function verificarSesion() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'admin-login.html';
        return;
    }
    cargarProductosAdmin();
    cargarCategorias();
    cargarPedidos();
}

verificarSesion();

document.getElementById('btn-cerrar-sesion').addEventListener('click', async function () {
    await supabaseClient.auth.signOut();
    window.location.href = 'admin-login.html';
});

async function cargarProductosAdmin() {
    const { data: productos, error } = await supabaseClient
        .from('productos')
        .select('*')
        .order('id');

    if (error) {
        console.error('Error cargando productos:', error);
        return;
    }

    const contenedor = document.getElementById('lista-productos-admin');
    contenedor.innerHTML = '';

    productos.forEach(function (producto) {
        const div = document.createElement('div');
        div.className = 'producto-admin-item';
        div.dataset.id = producto.id;

        let claseStock = 'stock-normal';
        let textoStock = 'Stock normal';
        if (producto.stock === 0) {
            claseStock = 'stock-agotado';
            textoStock = 'Agotado';
        } else if (producto.stock <= 9) {
            claseStock = 'stock-bajo';
            textoStock = 'Stock bajo';
        }

        div.innerHTML = `
            <div class="producto-vista">
                <span>${producto.nombre} - $${producto.precio.toLocaleString('es-CO')}</span>
                <span class="producto-acciones">
                    <input type="number" class="input-stock-editable" value="${producto.stock}" data-id="${producto.id}">
                    <span class="stock-badge ${claseStock}">${textoStock}</span>
                    <button class="btn-icono btn-editar" data-id="${producto.id}">✏️</button>
                    <button class="btn-icono btn-eliminar" data-id="${producto.id}">🗑️</button>
                </span>
            </div>

            <div class="producto-edicion oculto-admin" id="edicion-${producto.id}">
                <input type="text" class="edit-nombre" value="${producto.nombre}" placeholder="Nombre">
                <input type="number" class="edit-precio" value="${producto.precio}" placeholder="Precio">
                <select class="edit-categoria">
                    <option value="tecnologia" ${producto.categoria === 'tecnologia' ? 'selected' : ''}>Tecnología</option>
                    <option value="ropa" ${producto.categoria === 'ropa' ? 'selected' : ''}>Ropa</option>
                    <option value="calzado" ${producto.categoria === 'calzado' ? 'selected' : ''}>Calzado</option>
                </select>
                <input type="text" class="edit-imagen" value="${producto.imagen_url || ''}" placeholder="URL de imagen">
                <div class="edicion-botones">
                    <button class="btn btn-guardar-edicion" data-id="${producto.id}">Guardar</button>
                    <button class="btn-cancelar-edicion" data-id="${producto.id}">Cancelar</button>
                </div>
            </div>
        `;
        contenedor.appendChild(div);
    });

    activarEventosProductos();
}






async function cargarCategorias() {
    const { data: categorias, error } = await supabaseClient
        .from('categorias')
        .select('*')
        .order('id');

    if (error) {
        console.error('Error cargando categoria:', error);
        return;
    }

const selectCategoria = document.getElementById('nuevo-categoria');
 const contenedor = document.getElementById('lista-categorias-admin');contenedor.innerHTML='';

categorias.forEach(function (cat){
    const div = document.createElement('div');
    div.className = 'categorias';
    div.dataset.id = cat.id;
    div.innerHTML = `<span>${cat.nombre}</span>`;
    contenedor.appendChild(div);
    const opcion = document.createElement('option');
opcion.value = cat.slug;
opcion.textContent = cat.nombre;
selectCategoria.appendChild(opcion);
})

}


 



function activarEventosProductos() {
    // Cambiar stock directo
    document.querySelectorAll('.input-stock-editable').forEach(function (input) {
        input.addEventListener('change', async function () {
            const id = input.dataset.id;
            const nuevoStock = Number(input.value);

            const { error } = await supabaseClient
                .from('productos')
                .update({ stock: nuevoStock })
                .eq('id', id);

            if (error) {
                console.error('Error actualizando stock:', error);
                return;
            }
            cargarProductosAdmin();
        });
    });

    // Mostrar el formulario de edición
    document.querySelectorAll('.btn-editar').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = btn.dataset.id;
            document.getElementById('edicion-' + id).classList.remove('oculto-admin');
        });
    });

    // Cancelar edición
    document.querySelectorAll('.btn-cancelar-edicion').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = btn.dataset.id;
            document.getElementById('edicion-' + id).classList.add('oculto-admin');
        });
    });

    // Guardar los cambios de edición
    document.querySelectorAll('.btn-guardar-edicion').forEach(function (btn) {
        btn.addEventListener('click', async function () {
            const id = btn.dataset.id;
            const panel = document.getElementById('edicion-' + id);

            const nombre = panel.querySelector('.edit-nombre').value;
            const precio = Number(panel.querySelector('.edit-precio').value);
            const categoria = panel.querySelector('.edit-categoria').value;
            const imagen_url = panel.querySelector('.edit-imagen').value;

            const { error } = await supabaseClient
                .from('productos')
                .update({
                    nombre: nombre,
                    precio: precio,
                    categoria: categoria,
                    imagen_url: imagen_url || null
                })
                .eq('id', id);

            if (error) {
                console.error('Error guardando edición:', error);
                alert('Hubo un error al guardar los cambios.');
                return;
            }

            cargarProductosAdmin();
        });
    });

    // Eliminar producto
    document.querySelectorAll('.btn-eliminar').forEach(function (btn) {
        btn.addEventListener('click', async function () {
            const id = btn.dataset.id;

            const confirmar = confirm('¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.');
            if (!confirmar) return;

            const { error } = await supabaseClient
                .from('productos')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error eliminando producto:', error);
                alert('Hubo un error al eliminar el producto.');
                return;
            }

            cargarProductosAdmin();
        });
    });
}

document.getElementById('form-nuevo-producto').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nuevo-nombre').value;
    const precio = Number(document.getElementById('nuevo-precio').value);
    const categoria = document.getElementById('nuevo-categoria').value;
    const stock = Number(document.getElementById('nuevo-stock').value);
    const imagen = document.getElementById('nuevo-imagen').value;
    const mensaje = document.getElementById('mensaje-admin');

    const { error } = await supabaseClient
        .from('productos')
        .insert([{
            nombre: nombre,
            precio: precio,
            categoria: categoria,
            stock: stock,
            imagen_url: imagen || null
        }]);

    if (error) {
        mensaje.textContent = 'Error al agregar el producto.';
        mensaje.style.color = '#dc2626';
        console.error(error);
        return;
    }

    mensaje.textContent = '¡Producto agregado con éxito!';
    mensaje.style.color = '#16a34a';
    document.getElementById('form-nuevo-producto').reset();
    cargarProductosAdmin();
});

document.getElementById('form-nueva-categoria').addEventListener('submit', async function (evento) {
     evento.preventDefault();
    const nombre = document.getElementById('nueva-cat-nombre').value;
    const slug = crearSlug(nombre);
    const {error} = await supabaseClient
    .from('categorias')
    .insert([{ 
        nombre: nombre,
        slug: slug,
    }]);

    if (error){
        console.error('Error guardado categoria',error);
        return;
    }
    document.getElementById('nueva-cat-nombre').value = '';
    cargarCategorias();
});

function crearSlug(texto) {
    return texto
        .toLowerCase()                          // todo a minúsculas
        .normalize('NFD')                       // separa las letras de sus tildes
        .replace(/[\u0300-\u036f]/g, '')         // elimina esas tildes ya separadas
        .replace(/\s+/g, '');                    // elimina todos los espacios
}

// Convierte texto en "texto seguro" para meterlo dentro de HTML
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

async function cargarPedidos() {
    const { data: pedidos, error } = await supabaseClient
        .from('ordenes')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Error cargando pedidos:', error);
        return;
    }

    const contenedor = document.getElementById('lista-pedidos-admin');
    contenedor.innerHTML = '';

    if (pedidos.length === 0) {
        contenedor.innerHTML = '<p>Aún no hay pedidos.</p>';
        return;
    }

    pedidos.forEach(function (pedido) {
        const detalle = (pedido.productos || []).map(function (item) {
            return `<li>${escaparHTML(item.nombre)} x${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString('es-CO')}</li>`;
        }).join('');

        const entrega = pedido.metodo_entrega === 'domicilio'
            ? 'Domicilio: ' + escaparHTML(pedido.direccion || '')
            : 'Recoger en tienda';

        const claseEstado = pedido.estado === 'entregado' ? 'estado-entregado' : 'estado-pendiente';

        const div = document.createElement('div');
        div.className = 'pedido-item';
        div.innerHTML = `
            <div class="pedido-cabecera">
                <strong>Pedido #${pedido.id}</strong>
                <span class="pedido-estado ${claseEstado}">${escaparHTML(pedido.estado || 'pendiente')}</span>
            </div>
            <p>${escaparHTML(pedido.cliente_nombre)} - ${escaparHTML(pedido.cliente_telefono)}</p>
            ${pedido.cliente_email ? `<p>${escaparHTML(pedido.cliente_email)}</p>` : ''}
            <p>${entrega}</p>
            <ul>${detalle}</ul>
            <p><strong>Total: $${pedido.total.toLocaleString('es-CO')}</strong></p>
            ${pedido.estado !== 'entregado'
                ? `<button class="btn btn-entregar" data-id="${pedido.id}">Marcar como entregado</button>`
                : ''}
        `;
        contenedor.appendChild(div);
    });

    document.querySelectorAll('.btn-entregar').forEach(function (btn) {
        btn.addEventListener('click', async function () {
            const { error } = await supabaseClient
                .from('ordenes')
                .update({ estado: 'entregado' })
                .eq('id', btn.dataset.id);

            if (error) {
                console.error('Error actualizando pedido:', error);
                return;
            }
            cargarPedidos();
        });
    });
}