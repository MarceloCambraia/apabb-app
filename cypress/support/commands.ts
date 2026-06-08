declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): void
    }
  }
}

Cypress.Commands.add('login', (email?: string, password?: string) => {
  cy.request({
    method: 'POST',
    url: 'https://hyuwbysahezxobqcnbhc.supabase.co/auth/v1/token?grant_type=password',
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5dXdieXNhaGV6eG9icWNuYmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDMzMzcsImV4cCI6MjA3NDMxOTMzN30.vAKxGy4J_57Tc1bsB9ZGtC-uZFk-xWXDAnmLW73qvAs',
      'Content-Type': 'application/json'
    },
    body: {
      email: email || 'teste@apabb.org.br',
      password: password || 'Teste@apabb2026'
    }
  }).then((response) => {
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
})

export {}
