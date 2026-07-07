# APABB APP

> Plataforma de doações e voluntariado da APABB — Associação de Pais, Amigos e Pessoas com Deficiência de Funcionários do Banco do Brasil.

---

## Sobre o Projeto

O **APABB App** é um aplicativo mobile (Android) e web que permite:

- **Doações** via PIX, Boleto Bancário e Cartão de Crédito
- **Doações recorrentes** com sistema de badges (Apoiador, Protetor, Anjo)
- **Voluntariado** — cadastro, oportunidades e projetos
- **Associação** — cadastro de associados
- **Dashboard administrativo** — gestão de doações, voluntários e associados por núcleo

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + TypeScript + Vite + TailwindCSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Edge Functions Deno) |
| Mobile | Capacitor (Android) |
| Pagamentos | Banco do Brasil API (PIX v2, Cobranças v2, BB Pay v2) |
| Proxy mTLS | Node.js + Express (Google Cloud Run) |
| E-mail | Resend |

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- npm

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/MarceloCambraia/apabb-app.git
cd apabb-app

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse em: `http://localhost:8080`

---

## Build para Android

```bash
# 1. Build do projeto web
npm run build

# 2. Sincronizar com Android
npx cap sync android

# 3. Abrir no Android Studio
npx cap open android
```

No Android Studio: **Build → Build APK(s)**

**Package ID:** `br.org.apabb.app`

---

## Estrutura do Projeto
apabb-app/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── hooks/            # Custom hooks (usePixPayment, useSubscription...)
│   ├── pages/            # Páginas da aplicação
│   └── integrations/     # Configuração do Supabase
├── supabase/
│   └── functions/        # Edge Functions
│       ├── processar-dominio-bb/        # PIX BB v2
│       ├── gerar-boleto-bb/             # Boleto BB v2
│       ├── bb-pix-webhook/              # Webhook confirmação PIX
│       └── enviar-lembrete-recorrencia/ # Lembrete mensal (Resend)
└── android/              # Projeto Android (Capacitor)

---

## Integrações de Pagamento

| Método | Status | Observação |
|--------|--------|-----------|
| PIX (BB) | Produção | Via proxy mTLS Google Cloud Run |
| Boleto (BB) | API Cobranças v2 |
| Cartão (BB Pay) | Parcial | BB Pay v2 |

---

## Variáveis de Ambiente (Supabase Secrets)

| Secret | Descrição |
|--------|-----------|
| `BB_APP_KEY` | App Key de produção BB |
| `BB_BASIC_AUTH` | Basic Auth (Base64) das credenciais BB |
| `BB_CHAVE_PIX_DESTINO` | Chave PIX CNPJ da APABB |
| `PROXY_SECRET` | Token de autenticação do proxy mTLS |
| `BB_NUMERO_CONVENIO` | Número do convênio de cobrança BB |
| `BB_NUMERO_CARTEIRA` | Número da carteira BB |
| `BB_NUMERO_VARIACAO_CARTEIRA` | Variação da carteira BB |
| `RESEND_API_KEY` | API Key do Resend para e-mails |
| `BB_APP_KEY_BOLETO` | App Key específica para Boleto BB |
| `BB_BASIC_AUTH_BOLETO` | Basic Auth (Base64) para Boleto BB |
| `BB_NUMERO_CONVENIO_BBPAY` | Número do convênio BB Pay (cartão/checkout) |
| `TEST_EMAIL_OVERRIDE` | E-mail para testes de lembrete de recorrência |

---

## Proxy mTLS

Chamadas à API do Banco do Brasil que exigem certificado mTLS (PIX e BB Pay/Checkout) não podem ser feitas diretamente pelas Edge Functions — o certificado precisa ser apresentado durante o handshake TLS. Por isso, existe um proxy intermediário:

- **Repositório:** [bb-mtls-proxy](https://github.com/MarceloCambraia/bb-mtls-proxy)
- **Runtime:** Node.js + Express
- **Deploy:** Google Cloud Run (`bb-mtls-proxy-216085914365.us-central1.run.app`)
- **Autenticação:** header `x-proxy-secret` (variável `PROXY_SECRET`)

As Edge Functions enviam a requisição ao proxy, que anexa o certificado mTLS e repassa ao BB.

---

## Roles de Usuário

| Role | Acesso |
|------|--------|
| `user` | Doações, voluntariado, perfil |
| `admin` | Dashboard completo, todos os núcleos |
| `coordenador_voluntarios` | Dashboard de voluntários do seu núcleo |

---
