// Conexión a tu proyecto de Supabase
const SUPABASE_URL = 'https://qpvnqtxxzgiokyilbvoj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdm5xdHh4emdpb2t5aWxidm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNDI0NzMsImV4cCI6MjEwNDkxODQ3M30.D3YghsoD_fxvO8mr8xzYCmNvrrsbOLJQ0O_Ns3UBCio';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Función que trae los productos y los pinta en pantalla
async function cargarProductos() {
    const { data: productos, error } = await supabaseClient
        .from('productos')
        .select('*');

    if (error) {
        console.error('Error trayendo productos:', error);
        return;
    }
    console.log('Productos recibidos:', productos);

    // Recorremos cada producto y lo ponemos en su categoría correspondiente
    productos.forEach(function (producto) {
        const contenedor = document.getElementById('productos-' + producto.categoria);

        if (!contenedor) {
            console.warn('No existe contenedor para la categoría:', producto.categoria);
            return;
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${producto.imagen_url || 'img/placeholder.jpg'}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio.toLocaleString('es-CO')}</p>
            ${producto.stock > 0
    ? '<button class="btn">Agregar al carrito</button>'
    : '<button class="btn btn-agotado" disabled>Agotado</button>'}
        `;

        contenedor.appendChild(card);
    });

    // IMPORTANTE: avisamos a carrito.js que ya puede buscar los botones
    document.dispatchEvent(new Event('productos-cargados'));
}


async function renderizarCategorias() {
    const { data: categorias, error } = await supabaseClient
        .from('categorias')
        .select('*')
        .order('id');

    if (error) {
        console.error('Error cargando categorías:', error);
        return;
    }

    const contenedorPrincipal = document.getElementById('categorias-contenedor');

    categorias.forEach(function (cat) {
        const section = document.createElement('section');
        section.className = 'categoria';
        section.id = cat.slug;

        section.innerHTML = `
            <h2>${cat.nombre}</h2>
            <div class="productos" id="productos-${cat.slug}"></div>
        `;

        contenedorPrincipal.appendChild(section);
    });
}

renderizarCategorias().then(function () {
    cargarProductos();
});