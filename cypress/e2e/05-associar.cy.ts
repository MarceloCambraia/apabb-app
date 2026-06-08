describe('Página Associar-se', () => {
  beforeEach(() => {
    cy.visit('/associar')
  })

  it('exibe formulário de associação', () => {
    cy.contains(/associar|associação|cadastro/i).should('be.visible')
  })

  it('exibe campos do formulário', () => {
    cy.get('input[type="text"], input[type="email"]').should('have.length.greaterThan', 2)
  })
})
