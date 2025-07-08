describe('首页访问', () => {
  it('能正常加载首页', () => {
    cy.visit('http://localhost:5173');
    cy.contains('首页').should('exist');
  });
}); 