describe('Formulario de venta - Flujo completo', () => {
  it('Debería completar y enviar el formulario correctamente', () => {
    cy.visit('http://localhost:7050/');

    // Seleccionar el endpoint del select
    cy.get('#endpoint').select('POST /api/ventas (Crear)');

    // Índice de Tiempo
    cy.get('#postPutIndiceTiempo').click().type('2025-06-30');
    cy.get('#apiQueryForm').submit();

    // Canal
    cy.get('#postPutCanal').click().type('Tienda Física');
    cy.get('#apiQueryForm').submit();

    // Medio de Pago
    cy.get('#postPutMedioPago').click().type('efectivo');
    cy.get('#apiQueryForm').submit();

    // Categoría
    cy.get('#postPutCategoria').click().type('frutas');
    cy.get('#apiQueryForm').submit();

    // Producto y Total Ventas
    cy.get('#postPutProducto').click().type('naranja');
    cy.get('#postPutTotalVentas').click().type('15000');
    cy.get('#apiQueryForm').submit();

    // Unidades Vendidas
    cy.get('#postPutUnidadesVendidas').click().type('6500');
    cy.get('#apiQueryForm').submit();

    // Margen de Ganancia
    cy.get('#postPutMargenGanancia').click().type('40000');
    cy.get('#apiQueryForm').submit();

    // Enviar formulario final
    cy.xpath("//button[@type='submit']").click();
  });
});
