describe('Pruebas de la API de Ventas de Supermercados', () => {
    
    beforeEach(() => {
        cy.visit('http://localhost:7050'); // Asegúrense de que su frontend esté en esta URL
    });

    // Test 1: Verificar que se pueden obtener todos los registros de ventas
    it('Debería obtener todos los registros de ventas (GET /api/ventas)', () => {
        cy.request('GET', 'http://localhost:7050/api/ventas')
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.be.an('array');
                expect(response.body.data.length).to.be.greaterThan(0);
            });
    });

    // Test 2: Verificar que se puede obtener un registro por fecha específica
    it('Debería obtener un registro de venta por fecha (GET /api/ventas/:fecha)', () => {
        const fechaExistente = '2023-01-05';
        cy.request('GET', `http://localhost:7050/api/ventas/${fechaExistente}`)
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('indice_tiempo', fechaExistente);
            });
    });

    // Test 3: Verificar que se puede crear un nuevo registro (POST /api/ventas)
    it('Debería crear un nuevo registro de venta (POST /api/ventas)', () => {
        const nuevaFecha = `2024-01-01`;
        const nuevoRegistro = {
            indice_tiempo: nuevaFecha,
            canal: "Web",
            medio_pago: "Tarjeta de Credito",
            categoria: "Electronicos",
            producto: "Tablet",
            total_ventas: 12000,
            unidades_vendidas: 1,
            margen_ganancia: 3000
        };

        cy.request('POST', 'http://localhost:7050/api/ventas', nuevoRegistro)
            .then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('mensaje', 'Registro creado correctamente');
                cy.request('GET', `http://localhost:7050/api/ventas/${nuevaFecha}`)
                    .then((getResponse) => {
                        expect(getResponse.status).to.eq(200);
                        expect(getResponse.body.data).to.have.property('producto', 'Tablet');
                    });
            });
    });

    // Test 4: Verificar que se puede eliminar un registro (DELETE /api/ventas/:fecha)
    it('Debería eliminar un registro de venta (DELETE /api/ventas/:fecha)', () => {
        const fechaAEliminar = `2024-02-01`;
        const registroParaEliminar = {
            indice_tiempo: fechaAEliminar,
            canal: "Tienda",
            medio_pago: "Efectivo",
            categoria: "Limpieza",
            producto: "Detergente",
            total_ventas: 500,
            unidades_vendidas: 2,
            margen_ganancia: 100
        };

        cy.request('POST', 'http://localhost:7050/api/ventas', registroParaEliminar)
            .then((postResponse) => {
                expect(postResponse.status).to.eq(201); // Aseguramos que se creó

                // Ahora intentamos eliminarlo
                cy.request('DELETE', `http://localhost:7050/api/ventas/${fechaAEliminar}`)
                    .then((deleteResponse) => {
                        expect(deleteResponse.status).to.eq(200); // 200 OK
                        expect(deleteResponse.body).to.have.property('mensaje', 'Registro eliminado correctamente');

                        // Opcional: verificar que el registro ya no existe
                        cy.request({
                            method: 'GET',
                            url: `http://localhost:7050/api/ventas/${fechaAEliminar}`,
                            failOnStatusCode: false
                        }).then((getAfterDeleteResponse) => {
                            expect(getAfterDeleteResponse.status).to.eq(404); 
                            expect(getAfterDeleteResponse.body).to.have.property('error', 'Registro no encontrado para la fecha especificada.');
                        });
                    });
            });
    });

    // Test 5: Filtrar por Canal (GET /api/ventas/filtro/canal)
    it('Debería filtrar registros por canal (GET /api/ventas/filtro/canal)', () => {
        const canalBuscado = 'Online';
        cy.request('GET', `http://localhost:7050/api/ventas/filtro/canal?canal=${canalBuscado}`)
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.be.an('array');
                expect(response.body.data.length).to.be.greaterThan(0);
                response.body.data.forEach(record => {
                    expect(record.canal).to.include(canalBuscado);
                });
            });
    });

});