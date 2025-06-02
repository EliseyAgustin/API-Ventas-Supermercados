document.addEventListener('DOMContentLoaded', () => {
    const queryForm = document.getElementById('apiQueryForm');
    const endpointSelect = document.getElementById('endpoint');
    const resultContainer = document.getElementById('apiResult');

    // Elementos de parámetros
    const getFechaParams = document.getElementById('getFechaParams');
    const rangoFechaParams = document.getElementById('rangoFechaParams');
    const canalParams = document.getElementById('canalParams');
    const medioPagoParams = document.getElementById('medioPagoParams');
    const categoriaParams = document.getElementById('categoriaParams');
    const dataEntryParams = document.getElementById('dataEntryParams');
    const deleteFechaParams = document.getElementById('deleteFechaParams');

    // Mostrar/ocultar parámetros según el endpoint seleccionado
    endpointSelect.addEventListener('change', () => {
        const selectedEndpoint = endpointSelect.value;
        
        // Ocultar todos los parámetros
        getFechaParams.classList.add('hidden');
        rangoFechaParams.classList.add('hidden');
        canalParams.classList.add('hidden');
        medioPagoParams.classList.add('hidden');
        categoriaParams.classList.add('hidden');
        dataEntryParams.classList.add('hidden');
        deleteFechaParams.classList.add('hidden');
        
        // Mostrar parámetros según el endpoint
        if (selectedEndpoint === '/api/ventas/:fecha') {
            getFechaParams.classList.remove('hidden');
        } else if (selectedEndpoint === '/api/ventas/filtro/fecha') {
            rangoFechaParams.classList.remove('hidden');
        } else if (selectedEndpoint === '/api/ventas/filtro/canal') {
            canalParams.classList.remove('hidden');
        } else if (selectedEndpoint === '/api/ventas/filtro/medio-pago') {
            medioPagoParams.classList.remove('hidden');
        } else if (selectedEndpoint === '/api/ventas/filtro/categoria') {
            categoriaParams.classList.remove('hidden');
        } else if (selectedEndpoint === 'POST /api/ventas' || selectedEndpoint === 'PUT /api/ventas/:fecha') {
            dataEntryParams.classList.remove('hidden');
            if (selectedEndpoint === 'PUT /api/ventas/:fecha') {
                deleteFechaParams.classList.remove('hidden');
            }
        } else if (selectedEndpoint === 'DELETE /api/ventas/:fecha') {
            deleteFechaParams.classList.remove('hidden');
        }
    });

    // Manejar envío del formulario
    queryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const selectedEndpoint = endpointSelect.value;
        let url = '';
        let method = 'GET';
        let body = null;
        
        try {
            resultContainer.textContent = 'Cargando...';
            
            // Construir URL y método según el endpoint
            if (selectedEndpoint === '/api/ventas') {
                url = '/ventas';
            } 
            else if (selectedEndpoint === '/api/ventas/:fecha') {
                const fecha = document.getElementById('getFecha').value;
                if (!fecha) {
                    alert('Por favor, ingrese una fecha');
                    return;
                }
                url = `/ventas/${fecha}/Ventas%20totales`;
            }
            else if (selectedEndpoint === '/api/ventas/filtro/fecha') {
                const desde = document.getElementById('fechaDesde').value;
                const hasta = document.getElementById('fechaHasta').value;
                if (!desde || !hasta) {
                    alert('Por favor, ingrese ambas fechas');
                    return;
                }
                // Para rango de fechas, usamos el endpoint de todas las ventas y filtramos
                url = '/ventas';
            }
            else if (selectedEndpoint === '/api/ventas/filtro/canal') {
                const canal = document.getElementById('canal').value;
                if (!canal) {
                    alert('Por favor, ingrese un canal');
                    return;
                }
                // Mapear canales a productos
                const canalMap = {
                    'Online': 'Ventas online',
                    'Salon': 'Ventas salon'
                };
                const producto = canalMap[canal] || canal;
                url = `/producto/${producto}`;
            }
            else if (selectedEndpoint === '/api/ventas/filtro/medio-pago') {
                const medio = document.getElementById('medioPago').value;
                if (!medio) {
                    alert('Por favor, ingrese un medio de pago');
                    return;
                }
                // Obtener todas las fechas para este medio de pago
                url = `/producto/${medio}`;
            }
            else if (selectedEndpoint === '/api/ventas/filtro/categoria') {
                const categoria = document.getElementById('categoria').value;
                if (!categoria) {
                    alert('Por favor, ingrese una categoría');
                    return;
                }
                url = `/producto/${categoria}`;
            }
            else if (selectedEndpoint === 'POST /api/ventas') {
                method = 'POST';
                url = '/crear';
                body = JSON.stringify({
                    indice_tiempo: document.getElementById('postPutIndiceTiempo').value,
                    Canal: document.getElementById('postPutCanal').value,
                    'Medio de Pago': document.getElementById('postPutMedioPago').value,
                    Categoria: document.getElementById('postPutCategoria').value,
                    Producto: document.getElementById('postPutProducto').value,
                    'Ventas totales': parseInt(document.getElementById('postPutTotalVentas').value) || 0,
                    'Unidades Vendidas': parseInt(document.getElementById('postPutUnidadesVendidas').value) || 0,
                    'Margen Ganancia': parseInt(document.getElementById('postPutMargenGanancia').value) || 0
                });
            }
            else if (selectedEndpoint === 'PUT /api/ventas/:fecha') {
                method = 'PUT';
                const fecha = document.getElementById('deleteFecha').value;
                if (!fecha) {
                    alert('Por favor, ingrese una fecha');
                    return;
                }
                url = `/actualizar/${fecha}`;
                body = JSON.stringify({
                    Canal: document.getElementById('postPutCanal').value,
                    'Medio de Pago': document.getElementById('postPutMedioPago').value,
                    Categoria: document.getElementById('postPutCategoria').value,
                    Producto: document.getElementById('postPutProducto').value,
                    'Ventas totales': parseInt(document.getElementById('postPutTotalVentas').value) || 0,
                    'Unidades Vendidas': parseInt(document.getElementById('postPutUnidadesVendidas').value) || 0,
                    'Margen Ganancia': parseInt(document.getElementById('postPutMargenGanancia').value) || 0
                });
            }
            else if (selectedEndpoint === 'DELETE /api/ventas/:fecha') {
                method = 'DELETE';
                const fecha = document.getElementById('deleteFecha').value;
                if (!fecha) {
                    alert('Por favor, ingrese una fecha');
                    return;
                }
                url = `/eliminar/${fecha}`;
            }

            // Realizar petición
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (body) {
                options.body = body;
            }

            const response = await fetch(url, options);
            const data = await response.json();
            
            // Procesar respuesta para filtros de fecha si es necesario
            if (selectedEndpoint === '/api/ventas/filtro/fecha' && data.data) {
                const desde = document.getElementById('fechaDesde').value;
                const hasta = document.getElementById('fechaHasta').value;
                const fechaDesde = new Date(desde);
                const fechaHasta = new Date(hasta);
                
                data.data = data.data.filter(row => {
                    const fechaRow = new Date(row.indice_tiempo);
                    return fechaRow >= fechaDesde && fechaRow <= fechaHasta;
                });
            }
            
            // Limitar la cantidad de datos mostrados si es muy grande
            if (data.data && Array.isArray(data.data) && data.data.length > 10) {
                data.data = data.data.slice(0, 10);
                data.note = 'Mostrando solo los primeros 10 registros';
            }
            
            resultContainer.textContent = JSON.stringify(data, null, 2);
            
        } catch (error) {
            resultContainer.textContent = `Error: ${error.message}`;
        }
    });

    // Agregar botones para endpoints comunes
    const commonEndpoints = document.createElement('div');
    commonEndpoints.className = 'common-endpoints';
    commonEndpoints.innerHTML = `
        <h3>Endpoints Comunes</h3>
        <button type="button" id="mayorVenta">Mayor Venta</button>
        <button type="button" id="menorVenta">Menor Venta</button>
        <button type="button" id="todasVentas">Todas las Ventas</button>
    `;
    
    queryForm.appendChild(commonEndpoints);

    // Eventos para botones comunes
    document.getElementById('mayorVenta').addEventListener('click', async () => {
        try {
            resultContainer.textContent = 'Cargando...';
            const response = await fetch('/mayor-venta');
            const data = await response.json();
            resultContainer.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            resultContainer.textContent = `Error: ${error.message}`;
        }
    });

    document.getElementById('menorVenta').addEventListener('click', async () => {
        try {
            resultContainer.textContent = 'Cargando...';
            const response = await fetch('/menor-venta');
            const data = await response.json();
            resultContainer.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            resultContainer.textContent = `Error: ${error.message}`;
        }
    });

    document.getElementById('todasVentas').addEventListener('click', async () => {
        try {
            resultContainer.textContent = 'Cargando...';
            const response = await fetch('/ventas');
            const data = await response.json();
            // Mostrar solo los primeros 5 registros
            if (data.data && data.data.length > 5) {
                data.data = data.data.slice(0, 5);
                data.note = 'Mostrando solo los primeros 5 registros';
            }
            resultContainer.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            resultContainer.textContent = `Error: ${error.message}`;
        }
    });
});