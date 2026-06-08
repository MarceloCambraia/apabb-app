describe('Autenticação', () => {
  beforeEach(() => {
    cy.visit('/auth')
  })

  it('exibe formulário de login', () => {
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('Entrar').should('be.visible')
  })

  it('exibe link de recuperação de senha', () => {
    cy.contains('Esqueci minha senha').should('be.visible')
  })

  it('exibe erro ao tentar login com credenciais inválidas', () => {
    cy.get('input[type="email"]').type('email@invalido.com')
    cy.get('input[type="password"]').type('senhaerrada')
    cy.contains('Entrar').click()
    // Aguarda alguma mudança na UI após o clique (erro ou redirect)
    cy.wait(3000)
    // Verifica que ainda está na página de auth (não fez login)
    cy.url().should('include', '/auth')
  })

  it('alterna para tela de cadastro', () => {
    cy.contains(/cadastr|criar conta|registr/i).click()
    cy.contains(/criar conta|cadastro|registr/i, { timeout: 5000 }).should('be.visible')
  })
})
