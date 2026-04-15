# APABB Together
## Plataforma Digital de Engajamento e Doações
### Aplicativo Móvel e Web

**Dezembro/2024**

---

## Histórico de Revisões

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 04/12/2024 | 1.0 | Criação do documento | Equipe APABB |
|------------|-----|----------------------|--------------|
| 14/04/2026 | 1.1 | Inclusão de Gamificação e Módulo de Voluntariado | Equipe APABB |

---

## Sumário

1. [Introdução](#1-introdução)
   - 1.1. [Objetivo](#11-objetivo)
   - 1.2. [Escopo](#12-escopo)
   - 1.3. [Justificativa](#13-justificativa)
   - 1.4. [Diferencial Estratégico](#14-diferencial-estratégico)
2. [Declaração de Visão](#2-declaração-de-visão)
   - 2.1. [Tecnologias](#21-tecnologias)
   - 2.2. [Arquitetura](#22-arquitetura)
   - 2.3. [Serviços](#23-serviços)
   - 2.4. [Modelo de Dados](#24-modelo-de-dados)
   - 2.5. [Interface](#25-interface)
3. [Observações Gerais](#3-observações-gerais)
4. [Conclusão](#4-conclusão)

---

## 1. Introdução

O documento de visão tem a finalidade de capturar as restrições de design e requisitos de alto nível do sistema APABB Together. A ideia é mostrar uma visão macro do produto desenvolvido e facilitar sua compreensão, fornecendo uma visão ampla do que foi desenvolvido sem se aprofundar em detalhes técnicos.

### 1.1. Objetivo

O propósito deste documento é expor as necessidades e funcionalidades gerais do sistema APABB Together, definindo os requisitos de alto nível do produto em termos de necessidades dos usuários finais. O sistema foi desenvolvido para fortalecer o ecossistema de doações, voluntariado e engajamento da APABB (Associação de Pais, Amigos e Pessoas com Deficiência, de Funcionários do Banco do Brasil e da Comunidade).

### 1.2. Escopo

O sistema APABB Together é uma plataforma digital multiplataforma (Web, Android, iOS) que permite:

- **Captação de Doações**: Fluxo otimizado para doações únicas e recorrentes (mensais)
- **Clube de Benefícios**: Programa de fidelidade para doadores recorrentes com descontos em empresas parceiras
- **Engajamento Gamificado**: Perfil de usuário com sistema de progressão, metas de contribuição e reconhecimento por conquistas para incentivar a retenção
- **Voluntariado**: Cadastro e gestão de voluntários por área de interesse
- **Associação**: Registro de novos associados à APABB
- **Projetos Regionais**: Divulgação dos projetos de cada um dos 15 núcleos regionais
- **Marketplace Solidário**: Vitrine de produtos e serviços para geração de renda
- **Transparência**: Portal com relatórios de impacto e prestação de contas
- **Notícias e Eventos**: Agregação de conteúdo do site institucional com filtro por núcleo

### 1.3. Justificativa

A APABB, com 38 anos de história na defesa e promoção dos direitos das pessoas com deficiência e suas famílias, identificou a necessidade de modernizar sua estratégia de captação de recursos e engajamento digital. O aplicativo atende a três pilares estratégicos:

1. **Fortalecimento da Marca**: Aumentar a visibilidade nacional da APABB
2. **Ampliação de Recursos**: Expandir a captação de doações e parcerias
3. **Engajamento Digital**: Criar um ambiente comunitário de engajamento contínuo

A prioridade principal é a captação de **doações recorrentes mensais**, que proporcionam previsibilidade financeira para os projetos sociais.

### 1.4. Diferencial Estratégico

- **Clube de Benefícios Exclusivo**: Doadores recorrentes ganham acesso a descontos e vantagens em empresas parceiras, criando uma relação de valor mútuo
- **Cobertura Nacional**: Atendimento aos 15 núcleos regionais com gestão descentralizada
- **Transparência Total**: Portal dedicado com relatórios de impacto e histórias de transformação
- **Experiência Mobile-First**: Design responsivo otimizado para dispositivos móveis
- **Integração de Conteúdo**: Notícias e eventos sincronizados automaticamente do site institucional
- **Fidelização por Gamificação**: O uso de níveis e insígnias transforma a doação em uma jornada de impacto visível para o doador

---

## 2. Declaração de Visão

### 2.1. Tecnologias

Este tópico descreve as principais tecnologias envolvidas no projeto, abordando front-end, back-end e persistência de dados.

#### 2.1.1. React

React é uma biblioteca JavaScript de código aberto para construção de interfaces de usuário. Desenvolvida pelo Facebook, permite criar componentes reutilizáveis e gerenciar o estado da aplicação de forma eficiente através de um DOM virtual.

#### 2.1.2. TypeScript

TypeScript é uma linguagem de programação de código aberto desenvolvida pela Microsoft. É um superconjunto sintático de JavaScript que adiciona tipagem estática opcional, proporcionando maior segurança e produtividade no desenvolvimento.

#### 2.1.3. Vite

Vite é uma ferramenta de build moderna para projetos web. Oferece um servidor de desenvolvimento extremamente rápido com Hot Module Replacement (HMR) e build otimizado para produção usando Rollup.

#### 2.1.4. Tailwind CSS

Framework CSS utilitário que permite construir designs customizados rapidamente. Proporciona classes de baixo nível que podem ser compostas para criar qualquer design diretamente no HTML/JSX.

#### 2.1.5. Shadcn/UI

Coleção de componentes de UI reutilizáveis construídos com Radix UI e Tailwind CSS. São componentes acessíveis, customizáveis e de código aberto que podem ser copiados diretamente para o projeto.

#### 2.1.6. Capacitor

Framework de código aberto para construção de aplicativos móveis nativos usando tecnologias web (HTML, CSS, JavaScript). Permite compilar o mesmo código para Web, Android e iOS.

#### 2.1.7. Supabase

Plataforma Backend-as-a-Service (BaaS) de código aberto que fornece:
- **PostgreSQL**: Banco de dados relacional robusto
- **Autenticação**: Sistema completo de autenticação com múltiplos provedores
- **Row Level Security (RLS)**: Políticas de segurança em nível de linha
- **Edge Functions**: Funções serverless para lógica de backend
- **Realtime**: Subscriptions em tempo real para mudanças no banco

#### 2.1.8. React Query (TanStack Query)

Biblioteca para gerenciamento de estado assíncrono em React. Simplifica o fetching, caching e sincronização de dados do servidor.

### 2.2. Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Web App   │  │  Android    │  │    iOS      │              │
│  │   (React)   │  │ (Capacitor) │  │ (Capacitor) │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLOUD                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API Gateway                           │   │
│  │              (PostgREST + GoTrue)                        │   │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                    │
│  ┌────────────┐  ┌────────┴───────┐  ┌─────────────────┐        │
│  │   Auth     │  │   PostgreSQL   │  │  Edge Functions │        │
│  │  Service   │  │   + RLS        │  │   (Deno)        │        │
│  └────────────┘  └────────────────┘  └─────────────────┘        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Storage                               │   │
│  │              (Arquivos e Imagens)                        │   │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Web Scraping
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SITE INSTITUCIONAL                            │
│                  https://www.apabb.org.br/                      │
│              (Fonte de Notícias e Eventos)                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3. Serviços

O backend do APABB Together utiliza a arquitetura serverless do Supabase, com os seguintes serviços:

#### APIs REST (PostgREST)

| Endpoint | Descrição |
|----------|-----------|
| `/rest/v1/profiles` | Perfis de usuários |
| `/rest/v1/donations` | Registro de doações |
| `/rest/v1/associates` | Cadastro de associados |
| `/rest/v1/volunteers` | Cadastro de voluntários |
| `/rest/v1/user_roles` | Papéis e permissões de usuários |

#### Edge Functions

| Função | Descrição |
|--------|-----------|
| `fetch-apabb-news` | Scraping de notícias do site institucional |
| `create-admin-users` | Criação de usuários administradores por núcleo |

#### Serviços de Autenticação

- Login com email/senha
- Registro de novos usuários
- Recuperação de senha
- Gerenciamento de sessão

### 2.4. Modelo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                         auth.users                              │
│  (Gerenciado pelo Supabase Auth)                                │
│  ┌─────────────┬──────────────────────────────────────────┐     │
│  │ id          │ UUID (PK)                                 │    │
│  │ email       │ VARCHAR                                   │    │
│  │ created_at  │ TIMESTAMP                                 │    │
│  └─────────────┴──────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         profiles                                │
│  ┌─────────────┬──────────────────────────────────────────┐     │
│  │ id          │ UUID (PK)                                 │    │
│  │ full_name   │ TEXT                                      │    │
│  │ phone       │ TEXT                                      │    │
│  │ nucleus     │ TEXT                                      │    │
│  │ created_at  │ TIMESTAMP                                 │    │
│  │ updated_at  │ TIMESTAMP                                 │    │
│  └─────────────┴──────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   user_roles    │ │   donations     │ │   associates    │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ id (PK)         │ │ id (PK)         │ │ id (PK)         │
│ user_id (FK)    │ │ user_id (FK)    │ │ name            │
│ role (ENUM)     │ │ amount          │ │ cpf             │
│ nucleus         │ │ is_recurring    │ │ email           │
│ created_at      │ │ nucleus         │ │ phone           │
└─────────────────┘ │ payment_method  │ │ birth_date      │
                    │ payment_status  │ │ address         │
                    │ created_at      │ │ nucleus         │
                    │ updated_at      │ │ relationship    │
                    └─────────────────┘ │ created_at      │
                                        └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        volunteers                               │
│  ┌─────────────┬──────────────────────────────────────────┐     │
│  │ id          │ UUID (PK)                                 │    │
│  │ name        │ TEXT                                      │    │
│  │ email       │ TEXT                                      │    │
│  │ phone       │ TEXT                                      │    │
│  │ nucleus     │ TEXT                                      │    │
│  │ interest_   │ TEXT                                      │    │
│  │ area        │                                           │    │
│  │ message     │ TEXT                                      │    │
│  │ created_at  │ TIMESTAMP                                 │    │
│  └─────────────┴──────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

#### Enumerações

```sql
-- Papéis de usuário
CREATE TYPE app_role AS ENUM ('admin', 'user');
```

#### Políticas de Segurança (RLS)

- Usuários podem visualizar e editar apenas seus próprios dados
- Administradores têm acesso aos dados do seu núcleo específico
- Doações são visíveis apenas para o próprio usuário ou admin do núcleo

### 2.5. Interface

A interface do APABB Together foi projetada seguindo os princípios de:

- **Mobile-First**: Design responsivo otimizado para dispositivos móveis
- **Acessibilidade**: Componentes acessíveis seguindo WCAG 2.1
- **Identidade Visual**: Cores institucionais (Azul #003366, Amarelo #FDC500)

#### Fluxo Principal de Navegação

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOME                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Hero Banner + CTA Doação                                │   │
│  │  Seção de Doação Rápida                                  │   │
│  │  Cards de Navegação                                      │   │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐──────────────────────┐
        │                     │                     │                      │
        ▼                     ▼                     ▼                      ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐      ┌────────────────┐
│    DOAR       │     │   PROJETOS    │     │  VOLUNTARIADO │      │     PERFIL     │
│               │     │               │     │               │      │                │
│ • Valor único │     │ • Por núcleo  │     │ • Cadastro    │      │ • Dashboard    │
│ • Recorrente  │     │ • Detalhes    │     │ • Áreas       │      │ • Conquistas   │
│ • PIX/Cartão  │     │ • Impacto     │     │ • Disponib.   │      │ • Estatísticas │
└───────────────┘     └───────────────┘     └───────────────┘      └────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                    CLUBE DE BENEFÍCIOS                        │
│  (Acesso exclusivo para doadores recorrentes)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Parceiro 1 │  │  Parceiro 2 │  │  Parceiro 3 │            │
│  │  Desconto % │  │  Desconto % │  │  Desconto % │            │
│  │  QR Code    │  │  Cupom      │  │  Link       │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└───────────────────────────────────────────────────────────────┘
```

#### Páginas do Sistema

| Página | Rota | Descrição |
|--------|------|-----------|
| Home | `/` | Página inicial com visão geral |
| Doar | `/doar` | Fluxo de doação |
| Projetos | `/projetos` | Projetos regionais |
| Voluntariado | `/voluntariado` | Cadastro de voluntários |
| Associar | `/associar` | Registro de associados |
| Clube de Benefícios | `/clube-beneficios` | Benefícios para doadores |
| Marketplace | `/marketplace` | Produtos solidários |
| Notícias | `/noticias` | Feed de notícias |
| Transparência | `/transparencia` | Relatórios e prestação de contas |
| Login | `/auth` | Autenticação |
| Perfil | `/perfil` | Dados do usuário |
| Admin | `/admin` | Dashboard administrativo |

---

## 3. Observações Gerais

### Requisitos de Infraestrutura

- **Hospedagem**: Lovable Platform (frontend) + Supabase Cloud (backend)
- **CDN**: Distribuição global de assets estáticos
- **SSL**: Certificado HTTPS obrigatório

### Integrações Futuras

- **Pagamentos**: Stripe ou Pagar.me para processamento de doações
- **Notificações**: Push notifications para engajamento
- **Analytics**: Métricas de uso e conversão

### Segurança

- Autenticação via Supabase Auth com tokens JWT
- Row Level Security (RLS) em todas as tabelas
- Políticas de acesso baseadas em papéis (RBAC)
- Dados sensíveis criptografados

### Escalabilidade

- Arquitetura serverless permite escala automática
- Edge Functions distribuídas globalmente
- Banco de dados PostgreSQL gerenciado

---

## 4. Conclusão

O APABB Together foi desenvolvido como uma plataforma digital completa para modernizar e ampliar o alcance da APABB. A arquitetura escolhida (React + Supabase + Capacitor) permite:

1. **Desenvolvimento Ágil**: Stack moderna com alta produtividade
2. **Multiplataforma**: Único código para Web, Android e iOS
3. **Escalabilidade**: Infraestrutura serverless que cresce conforme demanda
4. **Segurança**: Autenticação robusta e políticas de acesso granulares
5. **Manutenibilidade**: Código organizado em componentes reutilizáveis

O foco em **doações recorrentes** com o diferencial do **Clube de Benefícios** cria um ciclo virtuoso de engajamento, onde doadores são recompensados com vantagens exclusivas, incentivando a fidelização e o aumento da base de apoiadores.

A estrutura de **15 núcleos regionais** com administração descentralizada permite que cada região gerencie seus projetos, voluntários e associados de forma independente, mantendo a unidade da marca APABB em nível nacional.

---

**APABB - Associação de Pais, Amigos e Pessoas com Deficiência, de Funcionários do Banco do Brasil e da Comunidade**

*38 anos defendendo e promovendo os direitos das pessoas com deficiência e suas famílias.*
