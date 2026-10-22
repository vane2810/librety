
const API_URL = '/api/libros';

const tablaLibros = document.getElementById('tablaLibros');
const totalLibros = document.getElementById('totalLibros');
const totalStock = document.getElementById('totalStock');
const buscarLibro = document.getElementById('buscarLibro');

const modal = document.getElementById('modalLibro');
const formLibro = document.getElementById('formLibro');
const tituloModal = document.getElementById('tituloModal');

const libroId = document.getElementById('libroId');
const titulo = document.getElementById('titulo');
const autor = document.getElementById('autor');
const precio = document.getElementById('precio');
const stock = document.getElementById('stock');

let libros = [];

// Consultar todos los libros
async function cargarLibros() {
    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error('No se pudieron obtener los libros');
        }

        libros = await respuesta.json();

        totalLibros.textContent = libros.length;
        totalStock.textContent = libros.reduce(
            (total, libro) => total + Number(libro.stock), 0
        );

        mostrarLibros();
    } catch (error) {
        console.error(error);
        tablaLibros.innerHTML =
            '<tr><td colspan="6">Error al cargar los libros.</td></tr>';
    }
}

// Crear celdas de texto de forma segura
function crearCelda(texto) {
    const td = document.createElement('td');
    td.textContent = texto;
    return td;
}

// Mostrar libros en la tabla
function mostrarLibros() {
    const busqueda = buscarLibro.value.trim().toLowerCase();

    const filtrados = libros.filter(libro =>
        libro.titulo.toLowerCase().includes(busqueda) ||
        libro.autor.toLowerCase().includes(busqueda)
    );

    tablaLibros.replaceChildren();

    if (filtrados.length === 0) {
        const fila = document.createElement('tr');
        const celda = crearCelda('No se encontraron libros.');
        celda.colSpan = 6;
        celda.style.textAlign = 'center';
        fila.appendChild(celda);
        tablaLibros.appendChild(fila);
        return;
    }

    filtrados.forEach(libro => {
        const fila = document.createElement('tr');

        fila.appendChild(crearCelda(libro.id));
        fila.appendChild(crearCelda(libro.titulo));
        fila.appendChild(crearCelda(libro.autor));
        fila.appendChild(crearCelda(
            '$' + Number(libro.precio).toFixed(2)
        ));
        fila.appendChild(crearCelda(libro.stock));

        const acciones = document.createElement('td');

        const btnEditar = document.createElement('button');
        btnEditar.type = 'button';
        btnEditar.className = 'btn-editar';
        btnEditar.title = 'Editar libro';
        btnEditar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        btnEditar.addEventListener('click', () => editarLibro(libro.id));

        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.className = 'btn-eliminar';
        btnEliminar.title = 'Eliminar libro';
        btnEliminar.innerHTML = '<i class="fa-solid fa-trash"></i>';
        btnEliminar.addEventListener('click', () => eliminarLibro(libro.id));

        acciones.append(btnEditar, btnEliminar);
        fila.appendChild(acciones);

        tablaLibros.appendChild(fila);
    });
}

// Abrir modal para agregar
document.getElementById('btnAgregar').addEventListener('click', () => {
    formLibro.reset();
    libroId.value = '';
    tituloModal.textContent = 'Agregar libro';
    modal.hidden = false;
    titulo.focus();
});

// Cerrar modal
function cerrarModal() {
    modal.hidden = true;
    formLibro.reset();
}

document.getElementById('cerrarModal')
    .addEventListener('click', cerrarModal);

document.getElementById('cancelarModal')
    .addEventListener('click', cerrarModal);

modal.addEventListener('click', (evento) => {
    if (evento.target === modal) {
        cerrarModal();
    }
});

document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !modal.hidden) {
        cerrarModal();
    }
});

// Editar libro
function editarLibro(id) {
    const libro = libros.find(libro => Number(libro.id) === Number(id));

    if (!libro) return;

    libroId.value = libro.id;
    titulo.value = libro.titulo;
    autor.value = libro.autor;
    precio.value = libro.precio;
    stock.value = libro.stock;

    tituloModal.textContent = 'Editar libro';
    modal.hidden = false;
    titulo.focus();
}

// Guardar o actualizar libro
formLibro.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const id = libroId.value;

    const datos = {
        titulo: titulo.value.trim(),
        autor: autor.value.trim(),
        precio: Number(precio.value),
        stock: Number(stock.value)
    };

    if (
        !datos.titulo ||
        !datos.autor ||
        !Number.isFinite(datos.precio) ||
        datos.precio < 0 ||
        !Number.isInteger(datos.stock) ||
        datos.stock < 0
    ) {
        alert('Verifica los datos del libro.');
        return;
    }

    const url = id ? `${API_URL}/${id}` : API_URL;
    const metodo = id ? 'PUT' : 'POST';

    const botonGuardar = formLibro.querySelector('button[type="submit"]');
    botonGuardar.disabled = true;

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje || 'Error al guardar');
        }

        cerrarModal();
        await cargarLibros();

        alert(id
            ? 'Libro actualizado correctamente.'
            : 'Libro registrado correctamente.'
        );

    } catch (error) {
        alert(error.message);
    } finally {
        botonGuardar.disabled = false;
    }
});

// Eliminar libro
async function eliminarLibro(id) {
    const confirmar = confirm(
        '¿Estás seguro de que deseas eliminar este libro?'
    );

    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje || 'Error al eliminar');
        }

        await cargarLibros();
        alert('Libro eliminado correctamente.');

    } catch (error) {
        alert(error.message);
    }
}


// Opciones visuales del menú lateral
document.querySelectorAll('.nav-simulado').forEach(enlace => {
    enlace.addEventListener('click', (evento) => {
        evento.preventDefault();
    });
});


// Buscar libros
buscarLibro.addEventListener('input', mostrarLibros);

// Cargar los libros al abrir la página
cargarLibros();
