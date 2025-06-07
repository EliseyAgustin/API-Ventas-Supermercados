describe('Filtrar ventas por categoría', () => {
  it('Debería seleccionar el endpoint y buscar por categoría', () => {
    cy.visit('http://localhost:7050/');

    // Selección del endpoint
    cy.get('#endpoint').select('GET /api/ventas/filtro/categoria (Por categoría)');

    // Ingresar la categoría
    cy.get('#categoria').click().type('Frutas');

    // Enviar
    cy.xpath("//button[@type='submit']").click();
  });
});