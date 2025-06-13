describe('Creación de una Venta', () => {
  it('Completa el formulario y crea una nueva venta', () => {
    cy.visit('http://localhost:7050/');

    cy.get('#endpoint').select('POST');

    cy.get('#addFecha').type('2028-02-03');
    
    cy.get('#addAlimento').select('Limpieza'); 

    cy.get('#addCantidad').type('150');

    cy.get('#apiQueryForm').submit();
  });
});