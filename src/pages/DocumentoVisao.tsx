import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DocumentoVisao() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir / Salvar PDF
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0 print:max-w-none">
        <article className="prose prose-slate max-w-none print:prose-sm">
          {/* Cover Page */}
          <div className="text-center mb-16 print:mb-8 print:page-break-after-always">
            <div className="border-4 border-[#003366] p-12 print:p-8">
              <h1 className="text-4xl print:text-3xl font-bold text-[#003366] mb-4">
                APABB Together
              </h1>
              <h2 className="text-2xl print:text-xl font-semibold text-[#003366] mb-2">
                Plataforma Digital de Engajamento e Doações
              </h2>
              <p className="text-xl print:text-lg text-gray-600 mb-8">
                Aplicativo Móvel e Web
              </p>
              <div className="w-24 h-1 bg-[#FDC500] mx-auto mb-8"></div>
              <p className="text-lg text-gray-500">Dezembro/2024</p>
            </div>
          </div>

          {/* Revision History */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#003366] border-b-2 border-[#FDC500] pb-2 mb-4">
              Histórico de Revisões
            </h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#003366] text-white">
                  <th className="border border-gray-300 p-2 text-left">Data</th>
                  <th className="border border-gray-300 p-2 text-left">Versão</th>
                  <th className="border border-gray-300 p-2 text-left">Descrição</th>
                  <th className="border border-gray-300 p-2 text-left">Autor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">04/12/2024</td>
                  <td className="border border-gray-300 p-2">1.0</td>
                  <td className="border border-gray-300 p-2">Criação do documento</td>
                  <td className="border border-gray-300 p-2">Equipe APABB</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Table of Contents */}
          <section className="mb-12 print:page-break-after-always">
            <h2 className="text-2xl font-bold text-[#003366] border-b-2 border-[#FDC500] pb-2 mb-4">
              Sumário
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Introdução
                <ol className="list-decimal list-inside ml-6 mt-1 space-y-1">
                  <li>Objetivo</li>
                  <li>Escopo</li>
                  <li>Justificativa</li>
                  <li>Diferencial Estratégico</li>
                </ol>
              </li>
              <li>Declaração de Visão
                <ol className="list-decimal list-inside ml-6 mt-1 space-y-1">
                  <li>Tecnologias</li>
                  <li>Arquitetura</li>
                  <li>Serviços</li>
                  <li>Modelo de Dados</li>
                  <li>Interface</li>
                </ol>
              </li>
              <li>Observações Gerais</li>
              <li>Conclusão</li>
            </ol>
          </section>

          {/* Section 1: Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#003366] border-b-2 border-[#FDC500] pb-2 mb-4">
              1. Introdução
            </h2>
            <p className="text-gray-700 mb-4">
              O documento de visão tem a finalidade de capturar as restrições de design e requisitos de alto nível do sistema APABB Together. A ideia é mostrar uma visão macro do produto desenvolvido e facilitar sua compreensão, fornecendo uma visão ampla do que foi desenvolvido sem se aprofundar em detalhes técnicos.
            </p>

            <h3 className="text-xl font-semibold text-[#003366] mt-6 mb-3">1.1. Objetivo</h3>
            <p className="text-gray-700 mb-4">
              O propósito deste documento é expor as necessidades e funcionalidades gerais do sistema APABB Together, definindo os requisitos de alto nível do produto em termos de necessidades dos usuários finais. O sistema foi desenvolvido para fortalecer o ecossistema de doações, voluntariado e engajamento da APABB (Associação de Pais, Amigos e Pessoas com Deficiência, de Funcionários do Banco do Brasil e da Comunidade).
            </p>

            <h3 className="text-xl font-semibold text-[#003366] mt-6 mb-3">1.2. Escopo</h3>
            <p className="text-gray-700 mb-4">
              O sistema APABB Together é uma plataforma digital multiplataforma (Web, Android, iOS) que permite:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Captação de Doações:</strong> Fluxo otimizado para doações únicas e recorrentes (mensais)</li>
              <li><strong>Clube de Benefícios:</strong> Programa de fidelidade para doadores recorrentes com descontos em empresas parceiras</li>
              <li><strong>Voluntariado:</strong> Cadastro e gestão de voluntários por área de interesse</li>
              <li><strong>Associação:</strong> Registro de novos associados à APABB</li>
              <li><strong>Projetos Regionais:</strong> Divulgação dos projetos de cada um dos 15 núcleos regionais</li>
              <li><strong>Marketplace Solidário:</strong> Vitrine de produtos e serviços para geração de renda</li>
              <li><strong>Transparência:</strong> Portal com relatórios de impacto e prestação de contas</li>
              <li><strong>Notícias e Eventos:</strong> Agregação de conteúdo do site institucional com filtro por núcleo</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#003366] mt-6 mb-3">1.3. Justificativa</h3>
            <p className="text-gray-700 mb-4">
              A APABB, com 38 anos de história na defesa e promoção dos direitos das pessoas com deficiência e suas famílias, identificou a necessidade de modernizar sua estratégia de captação de recursos e engajamento digital. O aplicativo atende a três pilares estratégicos:
            </p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Fortalecimento da Marca:</strong> Aumentar a visibilidade nacional da APABB</li>
              <li><strong>Ampliação de Recursos:</strong> Expandir a captação de doações e parcerias</li>
              <li><strong>Engajamento Digital:</strong> Criar um ambiente comunitário de engajamento contínuo</li>
            </ol>
            <p className="text-gray-700 mt-4">
              A prioridade principal é a captação de <strong>doações recorrentes mensais</strong>, que proporcionam previsibilidade financeira para os projetos sociais.
            </p>

            <h3 className="text-xl font-semibold text-[#003366] mt-6 mb-3">1.4. Diferencial Estratégico</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Clube de Benefícios Exclusivo:</strong> Doadores recorrentes ganham acesso a descontos e vantagens em empresas parceiras</li>
              <li><strong>Cobertura Nacional:</strong> Atendimento aos 15 núcleos regionais com gestão descentralizada</li>
              <li><strong>Transparência Total:</strong> Portal dedicado com relatórios de impacto e histórias de transformação</li>
              <li><strong>Experiência Mobile-First:</strong> Design responsivo otimizado para dispositivos móveis</li>
              <li><strong>Integração de Conteúdo:</strong> Notícias e eventos sincronizados automaticamente do site institucional</li>
            </ul>
          </section>

          {/* Section 2: Vision Declaration */}
          <section className="mb-12 print:page-break-before-always">
            <h2 className="text-2xl font-bold text-[#003366] border-b-2 border-[#FDC500] pb-2 mb-4">
              2. Declaração de Visão
            </h2>

            <h3 className="text-xl font-semibold text-[#003366] mt-6 mb-3">2.1. Tecnologias</h3>
            <p className="text-gray-700 mb-4">
              Este tópico descreve as principais tecnologias envolvidas no projeto:
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#003366]">
                <h4 className="font-semibold text-[#003366]">React</h4>
                <p className="text-gray-600 text-sm">Biblioteca JavaScript para construção de interfaces de usuário com componentes reutilizáveis.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#003366]">
                <h4 className="font-semibold text-[#003366]">TypeScript</h4>
                <p className="text-gray-600 text-sm">Superset de JavaScript com tipagem estática para maior segurança no desenvolvimento.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#003366]">
                <h4 className="font-semibold text-[#003366]">Vite</h4>
                <p className="text-gray-600 text-sm">Ferramenta de build moderna com servidor de desenvolvimento rápido e HMR.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#003366]">
                <h4 className="font-semibold text-[#003366]">Tailwind CSS + Shadcn/UI</h4>
                <p className="text-gray-600 text-sm">Framework CSS utilitário com componentes acessíveis e customizáveis.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#003366]">
                <h4 className="font-semibold text-[#003366]">Capacitor</h4>
                <p className="text-gray-600 text-sm">Framework para compilação de aplicativos nativos (Android/iOS) a partir de código web.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#003366]">
                <h4 className="font-semibold text-[#003366]">Supabase</h4>
                <p className="text-gray-600 text-sm">Backend-as-a-Service com PostgreSQL, autenticação, RLS e Edge Functions.</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-[#003366] mt-8 mb-3">2.2. Arquitetura</h3>
            <div className="bg-gray-100 p-6 rounded-lg font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre text-gray-700">{`
┌─────────────────────────────────────────────────────┐
│                     CLIENTE                          │
│   Web App (React) │ Android │ iOS (Capacitor)       │
└─────────────────────────┬───────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────┐
│                  SUPABASE CLOUD                      │
│  ┌───────────┐  ┌────────────┐  ┌───────────────┐   │
│  │   Auth    │  │ PostgreSQL │  │ Edge Functions│   │
│  │  Service  │  │  + RLS     │  │    (Deno)     │   │
│  └───────────┘  └────────────┘  └───────────────┘   │
│  ┌─────────────────────────────────────────────┐    │
│  │              Storage (Arquivos)              │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h3 className="text-xl font-semibold text-[#003366] mt-8 mb-3">2.3. Serviços</h3>
            <h4 className="font-semibold text-gray-700 mt-4 mb-2">APIs REST (PostgREST)</h4>
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-[#003366] text-white">
                  <th className="border border-gray-300 p-2 text-left">Endpoint</th>
                  <th className="border border-gray-300 p-2 text-left">Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">/rest/v1/profiles</td><td className="border border-gray-300 p-2">Perfis de usuários</td></tr>
                <tr><td className="border border-gray-300 p-2">/rest/v1/donations</td><td className="border border-gray-300 p-2">Registro de doações</td></tr>
                <tr><td className="border border-gray-300 p-2">/rest/v1/associates</td><td className="border border-gray-300 p-2">Cadastro de associados</td></tr>
                <tr><td className="border border-gray-300 p-2">/rest/v1/volunteers</td><td className="border border-gray-300 p-2">Cadastro de voluntários</td></tr>
                <tr><td className="border border-gray-300 p-2">/rest/v1/user_roles</td><td className="border border-gray-300 p-2">Papéis e permissões</td></tr>
              </tbody>
            </table>

            <h4 className="font-semibold text-gray-700 mt-4 mb-2">Edge Functions</h4>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#003366] text-white">
                  <th className="border border-gray-300 p-2 text-left">Função</th>
                  <th className="border border-gray-300 p-2 text-left">Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">fetch-apabb-news</td><td className="border border-gray-300 p-2">Scraping de notícias do site institucional</td></tr>
                <tr><td className="border border-gray-300 p-2">create-admin-users</td><td className="border border-gray-300 p-2">Criação de usuários administradores</td></tr>
              </tbody>
            </table>

            <h3 className="text-xl font-semibold text-[#003366] mt-8 mb-3 print:page-break-before-always">2.4. Modelo de Dados</h3>
            <div className="bg-gray-100 p-6 rounded-lg font-mono text-xs overflow-x-auto">
              <pre className="whitespace-pre text-gray-700">{`
┌─────────────────────────────────────────────────────┐
│                    auth.users                        │
│  id (UUID) │ email (VARCHAR) │ created_at           │
└─────────────────────────┬───────────────────────────┘
                          │ 1:1
                          ▼
┌─────────────────────────────────────────────────────┐
│                     profiles                         │
│  id │ full_name │ phone │ nucleus │ timestamps      │
└─────────────────────────┬───────────────────────────┘
              ┌───────────┼───────────┐
              ▼           ▼           ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│   user_roles    │ │  donations  │ │   associates    │
├─────────────────┤ ├─────────────┤ ├─────────────────┤
│ user_id (FK)    │ │ user_id(FK) │ │ name, cpf       │
│ role (ENUM)     │ │ amount      │ │ email, phone    │
│ nucleus         │ │ is_recurring│ │ address         │
└─────────────────┘ │ nucleus     │ │ nucleus         │
                    └─────────────┘ └─────────────────┘

┌─────────────────────────────────────────────────────┐
│                    volunteers                        │
│  id │ name │ email │ phone │ nucleus │ interest_area│
└─────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h3 className="text-xl font-semibold text-[#003366] mt-8 mb-3">2.5. Interface</h3>
            <p className="text-gray-700 mb-4">
              A interface foi projetada seguindo princípios de Mobile-First, Acessibilidade (WCAG 2.1) e Identidade Visual APABB.
            </p>
            <h4 className="font-semibold text-gray-700 mt-4 mb-2">Páginas do Sistema</h4>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#003366] text-white">
                  <th className="border border-gray-300 p-2 text-left">Página</th>
                  <th className="border border-gray-300 p-2 text-left">Rota</th>
                  <th className="border border-gray-300 p-2 text-left">Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">Home</td><td className="border border-gray-300 p-2">/</td><td className="border border-gray-300 p-2">Página inicial</td></tr>
                <tr><td className="border border-gray-300 p-2">Doar</td><td className="border border-gray-300 p-2">/doar</td><td className="border border-gray-300 p-2">Fluxo de doação</td></tr>
                <tr><td className="border border-gray-300 p-2">Projetos</td><td className="border border-gray-300 p-2">/projetos</td><td className="border border-gray-300 p-2">Projetos regionais</td></tr>
                <tr><td className="border border-gray-300 p-2">Voluntariado</td><td className="border border-gray-300 p-2">/voluntariado</td><td className="border border-gray-300 p-2">Cadastro de voluntários</td></tr>
                <tr><td className="border border-gray-300 p-2">Associar</td><td className="border border-gray-300 p-2">/associar</td><td className="border border-gray-300 p-2">Registro de associados</td></tr>
                <tr><td className="border border-gray-300 p-2">Clube</td><td className="border border-gray-300 p-2">/clube-beneficios</td><td className="border border-gray-300 p-2">Benefícios para doadores</td></tr>
                <tr><td className="border border-gray-300 p-2">Marketplace</td><td className="border border-gray-300 p-2">/marketplace</td><td className="border border-gray-300 p-2">Produtos solidários</td></tr>
                <tr><td className="border border-gray-300 p-2">Notícias</td><td className="border border-gray-300 p-2">/noticias</td><td className="border border-gray-300 p-2">Feed de notícias</td></tr>
                <tr><td className="border border-gray-300 p-2">Transparência</td><td className="border border-gray-300 p-2">/transparencia</td><td className="border border-gray-300 p-2">Relatórios</td></tr>
                <tr><td className="border border-gray-300 p-2">Admin</td><td className="border border-gray-300 p-2">/admin</td><td className="border border-gray-300 p-2">Dashboard administrativo</td></tr>
              </tbody>
            </table>
          </section>

          {/* Section 3: General Observations */}
          <section className="mb-12 print:page-break-before-always">
            <h2 className="text-2xl font-bold text-[#003366] border-b-2 border-[#FDC500] pb-2 mb-4">
              3. Observações Gerais
            </h2>

            <h3 className="text-xl font-semibold text-[#003366] mt-6 mb-3">Requisitos de Infraestrutura</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Hospedagem:</strong> Lovable Platform (frontend) + Supabase Cloud (backend)</li>
              <li><strong>CDN:</strong> Distribuição global de assets estáticos</li>
              <li><strong>SSL:</strong> Certificado HTTPS obrigatório</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#003366] mt-6 mb-3">Integrações Futuras</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Pagamentos:</strong> Stripe ou Pagar.me para processamento de doações</li>
              <li><strong>Notificações:</strong> Push notifications para engajamento</li>
              <li><strong>Analytics:</strong> Métricas de uso e conversão</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#003366] mt-6 mb-3">Segurança</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Autenticação via Supabase Auth com tokens JWT</li>
              <li>Row Level Security (RLS) em todas as tabelas</li>
              <li>Políticas de acesso baseadas em papéis (RBAC)</li>
              <li>Dados sensíveis criptografados</li>
            </ul>
          </section>

          {/* Section 4: Conclusion */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#003366] border-b-2 border-[#FDC500] pb-2 mb-4">
              4. Conclusão
            </h2>
            <p className="text-gray-700 mb-4">
              O APABB Together foi desenvolvido como uma plataforma digital completa para modernizar e ampliar o alcance da APABB. A arquitetura escolhida (React + Supabase + Capacitor) permite:
            </p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li><strong>Desenvolvimento Ágil:</strong> Stack moderna com alta produtividade</li>
              <li><strong>Multiplataforma:</strong> Único código para Web, Android e iOS</li>
              <li><strong>Escalabilidade:</strong> Infraestrutura serverless que cresce conforme demanda</li>
              <li><strong>Segurança:</strong> Autenticação robusta e políticas de acesso granulares</li>
              <li><strong>Manutenibilidade:</strong> Código organizado em componentes reutilizáveis</li>
            </ol>
            <p className="text-gray-700 mb-4">
              O foco em <strong>doações recorrentes</strong> com o diferencial do <strong>Clube de Benefícios</strong> cria um ciclo virtuoso de engajamento, onde doadores são recompensados com vantagens exclusivas, incentivando a fidelização.
            </p>
            <p className="text-gray-700">
              A estrutura de <strong>15 núcleos regionais</strong> com administração descentralizada permite que cada região gerencie seus projetos de forma independente, mantendo a unidade da marca APABB em nível nacional.
            </p>
          </section>

          {/* Footer */}
          <footer className="border-t-2 border-[#003366] pt-6 mt-12 text-center">
            <p className="font-bold text-[#003366]">
              APABB - Associação de Pais, Amigos e Pessoas com Deficiência,<br />
              de Funcionários do Banco do Brasil e da Comunidade
            </p>
            <p className="text-gray-600 mt-2 italic">
              38 anos defendendo e promovendo os direitos das pessoas com deficiência e suas famílias.
            </p>
          </footer>
        </article>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 2cm;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:page-break-after-always {
            page-break-after: always;
          }
          .print\\:page-break-before-always {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
}
