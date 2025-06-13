describe('Eliminar una Venta dinamicamente por ID', () => {
  const fechaDePrueba = '2028-02-03';

  it('Buscar el ID de una venta por su fecha y luego usarlo para eliminarla', () => {
    cy.request('GET', `http://localhost:7050/api/ventas/fecha/${fechaDePrueba}`)
      .then(response => {

        const idParaEliminar = response.body.data[0].id_venta;

        cy.log(`Venta encontrada con ID: ${idParaEliminar}. Eliminando...`);

        cy.visit('http://localhost:7050/');

        cy.get('#endpoint').select('DELETE');

        cy.get('#deleteId').type(idParaEliminar);

        cy.get('#apiQueryForm').submit();
      });
  });
});