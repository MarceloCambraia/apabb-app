## Dashboard de Coordenadores de Voluntariado

Construir uma área administrativa dedicada à gestão de voluntariado, acessível para `admin` e para o novo papel `coordenador_voluntarios`. Coordenadores enxergam apenas dados do próprio núcleo; admins têm acesso global.

### 1. Mudanças no banco

- Adicionar `coordenador_voluntarios` ao enum `app_role`.
- Função SQL `is_volunteer_coordinator(_user_id, _nucleus)` (SECURITY DEFINER) para checar papel + núcleo sem recursão.
- Função `can_manage_volunteers(_user_id, _nucleus)` que retorna true se admin OU coordenador do núcleo.
- Novas RLS policies (mantendo as existentes):
  - `volunteers`: SELECT/UPDATE para coordenadores do mesmo núcleo.
  - `volunteer_opportunities`: SELECT/INSERT/UPDATE/DELETE para coordenadores do núcleo.
  - `project_registrations`: SELECT/UPDATE para coordenadores cujo núcleo == núcleo do projeto.
  - `nucleus_coordinators`: SELECT para qualquer coordenador/admin; INSERT/UPDATE/DELETE apenas admin (já existe).
- Permitir UPDATE em `volunteers` (hoje bloqueado) com policy via `can_manage_volunteers`.

### 2. Rotas (src/App.tsx)

Adicionar rotas protegidas:
- `/admin/voluntarios` → Dashboard
- `/admin/voluntarios/cadastros` → Lista de voluntários
- `/admin/voluntarios/oportunidades` → Oportunidades
- `/admin/voluntarios/projetos` → Inscrições em projetos
- `/admin/voluntarios/coordenadores` → Coordenadores (somente admin)

Wrapper `RequireVolunteerAdmin` que verifica `isAdmin || isCoordenadorVoluntarios` e redireciona para `/auth` ou `/`.

### 3. Hook de papéis

Estender `useUserRole` para também devolver `isCoordenadorVoluntarios` e o `nucleus` correspondente. Usar uma única consulta a `user_roles` por usuário e expor flags + nucleus.

### 4. Layout compartilhado

`src/components/admin/VolunteerAdminLayout.tsx`:
- Sidebar com navegação (Dashboard, Cadastros, Oportunidades, Projetos, Coordenadores).
- Item "Coordenadores" só aparece para admin.
- Header com nome do núcleo (ou "Global" para admin).

### 5. Páginas

- **DashboardVoluntarios.tsx**: 4 cards com counts via Supabase (`select count` filtrado por núcleo quando coordenador).
- **CadastrosVoluntarios.tsx**: tabela com filtros (núcleo, status, área, busca), badges de status, modal "Atualizar status" com `review_notes`. UPDATE em `volunteers` com `reviewed_by = auth.uid()`, `reviewed_at = now()`.
- **OportunidadesVoluntariado.tsx**: lista das `volunteer_opportunities`, dialog de criação/edição, ação encerrar (status=encerrado). Reaproveitar lógica do `AdminVolunteerOpportunitiesManager` existente.
- **InscricoesProjetos.tsx**: lista `project_registrations` com join em `projects` e `profiles` (duas queries + merge por `user_id`), aprovar/rejeitar.
- **CoordenadoresNucleo.tsx** (admin only): CRUD em `nucleus_coordinators` com form (name, email, phone, whatsapp, nucleus select, area).

### 6. Componentes auxiliares

- `StatusBadge` (pendente/aprovado/rejeitado/em_contato/ativo/encerrado).
- `ConfirmStatusDialog` reutilizável (status alvo + textarea de notas).
- Constantes: lista dos 15 núcleos e áreas de interesse (reaproveitar das já existentes em `VolunteerSection`).

### 7. Integração com menu admin existente

Em `AdminDashboard.tsx`, adicionar card/link "Gestão de Voluntariado" apontando para `/admin/voluntarios`.

### Detalhes técnicos

- Filtragem por núcleo no client: quando `isCoordenadorVoluntarios && !isAdmin`, aplicar `.eq('nucleus', userNucleus)` em todas as queries; RLS é a defesa real.
- Mutations usam `useMutation` + invalidação do React Query.
- Toasts via `useToast` para feedback.
- Sem mudanças no design system; usar tokens existentes (`bg-primary`, `text-muted-foreground`, etc.) e componentes shadcn (`Table`, `Dialog`, `Select`, `Input`, `Textarea`, `Badge`, `Card`).
- Desktop-first com responsividade mobile (tabelas com scroll-x).

### Ordem de execução

1. Migração SQL (enum + funções + policies + permissão de UPDATE em volunteers).
2. Hook `useUserRole` estendido.
3. Layout + rotas + guard.
4. Páginas (Dashboard → Cadastros → Oportunidades → Projetos → Coordenadores).
5. Link no `AdminDashboard`.
