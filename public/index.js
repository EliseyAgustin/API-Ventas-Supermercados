document.addEventListener('DOMContentLoaded', () => {
    const queryForm = document.getElementById('queryForm');
    const endpointSelect = document.getElementById('endpoint');
    const dateParams = document.getElementById('dateParams');
    const canalParams = document.getElementById('canalParams');
    const medioParams = document.getElementById('medioParams');
    const categoriaParams = document.getElementById('categoriaParams');
    const resultContainer = document.getElementById('result');

    // Mostrar/ocultar parámetros según el endpoint seleccionado
    endpointSelect.addEventListener('change', () => {
        const selectedEndpoint = endpointSelect.value;
        
        // Ocultar todos los parámetros
        dateParams.classList.add('hidden');
        canalParams.classList.add('hidden');
        medioParams.classList.add('hidden');
        categoriaParams.classList.add('hidden');
        
        // Mostrar parámetros según el endpoint
        if (selectedEndpoint === '/api/ventas/filtro/fecha') {
            dateParams.classList.remove('hidden');
        } else if (selectedEndpoint === '/api/ventas/filtro/canal') {
            canalParams.classList.remove('hidden');
        } else if (selectedEndpoint === '/api/ventas/filtro/medio-pago') {
            medioParams.classList.remove('hidden');
        } else if (selectedEndpoint === '/api/ventas/filtro/categoria') {
            categoriaParams.classList.remove('hidden');
        }
    });

    // Manejar envío del formulario
    queryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let url = endpointSelect.value;
        const selectedEndpoint = endpointSelect.value;
        
        // Agregar parámetros según el endpoint
        if (selectedEndpoint === '/api/ventas/filtro/fecha') {
            const desde = document.getElementById('desde').value;
            const hasta = document.getElementById('hasta').value;
            
            if (!desde || !hasta) {
                alert('Por favor, ingrese ambas fechas para filtrar');
                return;
            }
            
            url += `?desde=${desde}&hasta=${hasta}`;
        } else if (selectedEndpoint === '/api/ventas/filtro/canal') {
            const canal = document.getElementById('canal').value;
            url += `?canal=${canal}`;
        } else if (selectedEndpoint === '/api/ventas/filtro/medio-pago') {
            const medio = document.getElementById('medio').value;
            url += `?medio=${medio}`;
        } else if (selectedEndpoint === '/api/ventas/filtro/categoria') {
            const categoria = document.getElementById('categoria').value;
            url += `?categoria=${categoria}`;
        }
        
        try {
            resultContainer.textContent = 'Cargando...';
            
            const response = await fetch(url);
            const data = await response.json();
            
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
});