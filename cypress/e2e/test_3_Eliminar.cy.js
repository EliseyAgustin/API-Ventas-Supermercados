describe('Eliminar una Venta dinámicamente por ID', () => {
  const fechaDePrueba = '2028-02-03';

  it('Debería buscar el ID de una venta por su fecha y luego usarlo para eliminarla', () => {
    cy.request('GET', `http://localhost:7050/api/ventas/fecha/${fechaDePrueba}`)
      .then(response => {

        const idParaEliminar = response.body.data[0].id_venta;

        cy.log(`Venta encontrada con ID: ${idParaEliminar}. Procediendo a eliminar.`);

        cy.visit('http://localhost:7050/');

        cy.get('#endpoint').select('DELETE');

        cy.get('#deleteId').type(idParaEliminar);

        cy.get('#apiQueryForm').submit();
      });
  });
});