describe('Example E2E Test', () => {
  it('visits the home page', () => {
    cy.visit('/');
    cy.contains('learn').should('be.visible');
  });
});
