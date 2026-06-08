describe('Página de Voluntariado', () => {
  beforeEach(() => {
    cy.visit('/voluntariado')
  })

  it('exibe o hero da página', () => {
    cy.contains('Faça parte da nossa rede de voluntários').should('be.visible')
  })

  it('exibe seção de programas', () => {
    cy.contains('Nossos Programas e Projetos').should('be.visible')
  })

  it('exibe seção de oportunidades', () => {
    cy.contains('Oportunidades Abertas').should('be.visible')
  })

  it('exibe formulário de cadastro de voluntário', () => {
    cy.contains('Seja um Voluntário APABB').should('be.visible')
    cy.get('input[placeholder*="Nome"]').should('be.visible')
    cy.get('input[placeholder*="mail"]').should('be.visible')
  })

  it('valida campos obrigatórios do formulário', () => {
    cy.contains('Cadastrar como Voluntário').click()
    cy.get('input:invalid').should('have.length.greaterThan', 0)
  })
})
