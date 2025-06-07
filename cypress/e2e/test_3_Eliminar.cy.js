describe('Eliminar ventas por fecha', () => {
  it('Debería seleccionar el endpoint y eliminar las ventas de una fecha', () => {
    cy.visit('http://localhost:7050/');

    // Selección del endpoint DELETE
    cy.get('#endpoint').select('DELETE /api/ventas/:fecha (Eliminar)');

    // Ingresar fecha
    cy.get('#deleteFecha').click().type('2026-01-01');

    // Enviar
    cy.xpath("//button[@type='submit']").click();
  });
});