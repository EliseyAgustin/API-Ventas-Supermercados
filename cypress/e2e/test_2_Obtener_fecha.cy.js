describe('Obtener Ventas por Fecha', () => {
  it('Buscar por fecha y obtener los resultados', () => {
    cy.visit('http://localhost:7050/');

    cy.get('#endpoint').select('GET_BY_DATE');

    cy.get('#getFecha').type('2028-02-03');

    cy.get('#apiQueryForm').submit();
  });
});