describe('Obtener ventas por fecha', () => {
  it('Debería seleccionar el endpoint y buscar por fecha', () => {
    cy.visit('http://localhost:7050/');

    // Seleccionar el endpoint GET
    cy.get('#endpoint').select('GET /api/ventas/:fecha (Obtener por fecha)');

    // Ingresar la fecha
    cy.get('#getFecha').click().type('2026-01-01');

    // Enviar
    cy.xpath("//button[@type='submit']").click();
  });
});