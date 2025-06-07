describe('Formulario de venta - Flujo completo', () => {
  it('Debería completar y enviar el formulario correctamente', () => {
    cy.visit('http://localhost:7050/');

    // Seleccionar el endpoint del select
    cy.get('#endpoint').select('POST /api/ventas (Crear)');

    // Índice de Tiempo
    cy.get('#postPutIndiceTiempo').click().type('2026-01-01');

    // Canal
    cy.get('#postPutCanal').click().type('Tienda Física');

    // Medio de Pago
    cy.get('#postPutMedioPago').click().type('efectivo');

    // Categoría
    cy.get('#postPutCategoria').click().type('frutas');
    
    // Producto y Total Ventas
    cy.get('#postPutProducto').click().type('naranja');
    cy.get('#postPutTotalVentas').click().type('15000');

    // Unidades Vendidas
    cy.get('#postPutUnidadesVendidas').click().type('6500');
    
    // Margen de Ganancia
    cy.get('#postPutMargenGanancia').click().type('40000');
  
    // Enviar formulario final
    cy.xpath("//button[@type='submit']").click();
  });
});