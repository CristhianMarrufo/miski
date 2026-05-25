const sidebar = document.getElementById('carrito-sidebar');
const btnAbrirCarrito = document.getElementById('abrir-carrito');
const btnCerrarCarrito = document.getElementById('cerrar-carrito');
const carritoItemsContenedor = document.getElementById('carrito-items');
const carritoTotalPrecioTXT = document.getElementById('carrito-total-precio');
const contadorCarrito = document.getElementById('contador-carrito');
const btnFinalizarCompra = document.getElementById('btn-finalizar-compra');

const carritoVacioMensaje = document.createElement('p');
carritoVacioMensaje.id = 'carrito-vacio';
carritoVacioMensaje.style.cssText = "color: #666; text-align: center; margin-top: 4rem;";
carritoVacioMensaje.textContent = "El carrito está vacío.";

const modal = document.getElementById('modalCompra');
const cerrarModal = document.getElementById('cerrarModal');
const modalImagen = document.getElementById('modalImagen');
const modalTitulo = document.getElementById('modalTitulo');
const modalDescripcion = document.getElementById('modalDescripcion');
const modalPrecio = document.getElementById('modalPrecio');
const cantidadInput = document.getElementById('cantidadProducto');
const btnProcesarCompra = document.getElementById('btnProcesarCompra');

let BD_CARRITO = JSON.parse(localStorage.getItem('miski_carrito')) || [];

renderizarCarrito();

if (btnAbrirCarrito) btnAbrirCarrito.addEventListener('click', () => { sidebar.style.right = '0'; });
if (btnCerrarCarrito) btnCerrarCarrito.addEventListener('click', () => { sidebar.style.right = '-400px'; });

const tarjetasProductos = document.querySelectorAll('.product-card');
const botonesAgregarDirecto = document.querySelectorAll('.btn-agregar-directo');

if (tarjetasProductos.length > 0) {
    tarjetasProductos.forEach(tarjeta => {
        tarjeta.addEventListener('click', function() {
            const titulo = this.querySelector('h3').textContent;
            const descripcion = this.querySelector('p').textContent;
            const precio = this.querySelector('.price').textContent;
            const srcImagen = this.querySelector('.product-image img').src;

            modalTitulo.textContent = titulo;
            modalDescripcion.textContent = descripcion;
            modalPrecio.textContent = precio;
            modalImagen.src = srcImagen;
            cantidadInput.value = 1;

            modal.style.display = 'flex';
        });
    });

    botonesAgregarDirecto.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.stopPropagation();

            const tarjeta = this.closest('.product-card');
            const productoNombre = tarjeta.querySelector('h3').textContent;
            const precioNumerico = parseFloat(tarjeta.querySelector('.price').textContent.replace('S/', '').trim());
            const srcImagen = tarjeta.querySelector('.product-image img').src;

            const productoExistente = BD_CARRITO.find(item => item.nombre === productoNombre);

            if (productoExistente) {
                productoExistente.cantidad += 1;
            } else {
                BD_CARRITO.push({
                    nombre: productoNombre,
                    precio: precioNumerico,
                    cantidad: 1,
                    imagen: srcImagen
                });
            }

            sincronizarEstado();
            alert(`¡Se añadió 1 unidad de "${productoNombre}" directo al carrito!`);
        });
    });

    if (cerrarModal) cerrarModal.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    if (btnProcesarCompra) {
        btnProcesarCompra.addEventListener('click', () => {
            const cantidadIngresada = parseInt(cantidadInput.value);
            const productoNombre = modalTitulo.textContent;
            const precioNumerico = parseFloat(modalPrecio.textContent.replace('S/', '').trim());

            if(isNaN(cantidadIngresada) || cantidadIngresada < 1) {
                alert("Por favor, ingrese una cantidad válida.");
                return;
            }

            const productoExistente = BD_CARRITO.find(item => item.nombre === productoNombre);

            if (productoExistente) {
                productoExistente.cantidad += cantidadIngresada;
            } else {
                BD_CARRITO.push({
                    nombre: productoNombre,
                    precio: precioNumerico,
                    cantidad: cantidadIngresada,
                    imagen: modalImagen.src
                });
            }

            sincronizarEstado();
            alert(`¡"${productoNombre}" añadido correctamente!`);
            modal.style.display = 'none';
        });
    }
}

//carrito
function renderizarCarrito() {
    if (!carritoItemsContenedor) return;
    carritoItemsContenedor.innerHTML = '';
    let totalUnidades = 0;
    let costoTotal = 0;

    if (BD_CARRITO.length === 0) {
        carritoItemsContenedor.appendChild(carritoVacioMensaje);
        if(contadorCarrito) contadorCarrito.textContent = '0';
        if(carritoTotalPrecioTXT) carritoTotalPrecioTXT.textContent = 'S/ 0.00';
        return;
    }

    BD_CARRITO.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        totalUnidades += item.cantidad;
        costoTotal += subtotal;

        const itemFila = document.createElement('div');
        itemFila.style.display = "flex";
        itemFila.style.alignItems = "center";
        itemFila.style.gap = "1rem";
        itemFila.style.borderBottom = "1px solid #eee";
        itemFila.style.paddingBottom = "1rem";
        
        itemFila.innerHTML = `
            <img src="${item.imagen}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
            <div style="flex: 1;">
                <h4 style="margin: 0; font-size: 1.4rem; color: #333;">${item.nombre}</h4>
                <p style="margin: 0; font-size: 1.2rem; color: #666;">S/ ${item.precio.toFixed(2)}</p>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                    <button class="btn-modificar-cantidad" data-index="${index}" data-accion="disminuir" style="width: 24px; height: 24px; background: #eee; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">-</button>
                    <span style="font-size: 1.3rem; font-weight: bold; min-width: 20px; text-align: center;">${item.cantidad}</span>
                    <button class="btn-modificar-cantidad" data-index="${index}" data-accion="aumentar" style="width: 24px; height: 24px; background: #eee; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.8rem;">
                <span style="font-weight: bold; color: #2d5a43; font-size: 1.4rem;">S/ ${subtotal.toFixed(2)}</span>
                <button class="btn-eliminar-item" data-index="${index}" style="background: none; border: none; cursor: pointer; font-size: 1.4rem;">🗑️</button>
            </div>
        `;
        carritoItemsContenedor.appendChild(itemFila);
    });

    if(contadorCarrito) contadorCarrito.textContent = totalUnidades;
    if(carritoTotalPrecioTXT) carritoTotalPrecioTXT.textContent = `S/ ${costoTotal.toFixed(2)}`;

    asignarEventosControles();
}
//botones  de crud
function asignarEventosControles() {
    const botonesCantidad = document.querySelectorAll('.btn-modificar-cantidad');
    botonesCantidad.forEach(boton => {
        boton.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const accion = this.getAttribute('data-accion');
            
            if (accion === 'aumentar') {
                BD_CARRITO[index].cantidad += 1;
            } else if (accion === 'disminuir') {
                BD_CARRITO[index].cantidad -= 1;
                if (BD_CARRITO[index].cantidad < 1) {
                    BD_CARRITO.splice(index, 1);
                }
            }
            sincronizarEstado();
        });
    });

    const botonesEliminar = document.querySelectorAll('.btn-eliminar-item');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            BD_CARRITO.splice(index, 1);
            sincronizarEstado();
        });
    });
}

function sincronizarEstado() {
    localStorage.setItem('miski_carrito', JSON.stringify(BD_CARRITO));
    renderizarCarrito();
}
//boton de finalizasr compra
if (btnFinalizarCompra) {
    btnFinalizarCompra.addEventListener('click', () => {
        if(BD_CARRITO.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        const telefonoNegocio = "51918378549"; 
        let mensaje = `¡Hola MISKI! Me gustaría realizar el siguiente pedido:\n\n`;
        let costoTotal = 0;

        BD_CARRITO.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            costoTotal += subtotal;
            mensaje += `🔸 *${item.nombre}* \n   Cantidad: ${item.cantidad} und. | Subtotal: S/ ${subtotal.toFixed(2)}\n\n`;
        });

        mensaje += `*Total Estimado a Pagar: S/ ${costoTotal.toFixed(2)}*\n\n`;
        mensaje += `¿Me podrían confirmar la disponibilidad y los datos para el delivery? ¡Muchas gracias!`;

        const mensajeCodificado = encodeURIComponent(mensaje);
        const urlWhatsApp = `https://wa.me/${telefonoNegocio}?text=${mensajeCodificado}`;

        window.location.href = urlWhatsApp;

        BD_CARRITO = [];
        localStorage.removeItem('miski_carrito');
        renderizarCarrito();
        if(sidebar) sidebar.style.right = '-400px';
    });
}

/*para el boton ver prod estrella*/
document.addEventListener("DOMContentLoaded", () => {
    const parametrosURL = new URLSearchParams(window.location.search);
    
    if (parametrosURL.get('ver') === 'chancaca') {
        const tarjetas = document.querySelectorAll('.product-card');
        
        tarjetas.forEach(tarjeta => {
            const tituloProducto = tarjeta.querySelector('h3').textContent;
            if (tituloProducto.includes('Chancaca')) {
                tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    tarjeta.click();
                }, 600);
            }
        });
    }
});

//imagenes en nosotos
document.addEventListener("DOMContentLoaded", () => {
    // Seleccionamos las imágenes dentro de las tarjetas de la sección Nosotros
    const fotosNosotros = document.querySelectorAll('.foto-item img');

    fotosNosotros.forEach(imagen => {
        imagen.addEventListener('mouseenter', function() {
            // Aplicamos un escalado dinámico directo sobre el elemento
            this.style.transform = 'scale(1.15)';
            this.style.cursor = 'pointer';
        });
        imagen.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// logo miski

document.addEventListener("DOMContentLoaded", () => {
    const imagenLogo = document.querySelector('.logo img');

    if (imagenLogo) {
        imagenLogo.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });

        imagenLogo.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
});

// por q elegir miski
document.addEventListener("DOMContentLoaded", () => {
    const tarjetasInfo = document.querySelectorAll('.info .card');

    tarjetasInfo.forEach(tarjeta => {
        tarjeta.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
            this.style.cursor = 'pointer';
        });

        tarjeta.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
        });
    });
});
