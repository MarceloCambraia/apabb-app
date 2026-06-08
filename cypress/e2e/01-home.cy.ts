describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('exibe o hero com botão de doação', () => {
    cy.contains('Transforme vidas com sua doação').should('exist')
    cy.contains('Começar a Doar').should('exist')
  })

  it('exibe as métricas da APABB', () => {
    cy.contains('2.5K+').should('exist')
    cy.contains('15K+').should('exist')
    cy.contains('95%').should('exist')
  })

  it('exibe os cards de navegação', () => {
    cy.contains('Conheça a APABB').should('exist')
    cy.contains('Doar').should('exist')
    cy.contains('Marketplace').should('exist')
    cy.contains('Voluntariado').should('exist')
  })

  it('botão Começar a Doar está presente e clicável', () => {
    cy.contains('Começar a Doar').first().click({ force: true })
    cy.url().should('match', /\/(doar|auth)/)
  })
})
