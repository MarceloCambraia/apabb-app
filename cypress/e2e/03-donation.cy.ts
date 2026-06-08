describe('Fluxo de Doação', () => {
  beforeEach(() => {
    // Login via API do Supabase (mais confiável que UI no Cypress)
    cy.request({
      method: 'POST',
      url: 'https://hyuwbysahezxobqcnbhc.supabase.co/auth/v1/token?grant_type=password',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5dXdieXNhaGV6eG9icWNuYmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDMzMzcsImV4cCI6MjA3NDMxOTMzN30.vAKxGy4J_57Tc1bsB9ZGtC-uZFk-xWXDAnmLW73qvAs',
        'Content-Type': 'application/json'
      },
      body: {
        email: 'teste@apabb.org.br',
        password: 'Teste@apabb2026'
      }
    }).then((response) => {
      // Salvar token na sessão do Supabase no localStorage
      window.localStorage.setItem(
        'sb-hyuwbysahezxobqcnbhc-auth-token',
        JSON.stringify({
          access_token: response.body.access_token,
          refresh_token: response.body.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + response.body.expires_in,
          token_type: 'bearer',
          user: response.body.user
        })
      )
    })
    cy.visit('/doar')
  })

  it('exibe os valores de doação', () => {
    cy.contains('R$ 25').should('be.visible')
    cy.contains('R$ 60').should('be.visible')
    cy.contains('R$ 100').should('be.visible')
  })

  it('exibe checkbox de doação recorrente', () => {
    cy.contains('Doação Mensal Recorrente').should('be.visible')
  })

  it('seleciona valor de doação', () => {
    cy.contains('R$ 25').click()
    cy.contains('Próximo').should('be.visible')
  })

  it('exibe opções de pagamento no passo 2', () => {
    cy.contains('R$ 25').click()
    cy.contains('Próximo').click()
    cy.contains('PIX').should('be.visible')
    cy.contains('Boleto').should('be.visible')
  })
})
