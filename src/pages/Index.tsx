import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Users, Award, Newspaper, FileText } from "lucide-react";

const mobileMetrics = [
  { value: "2.5K+", label: "Doadores Ativos" },
  { value: "15K+", label: "Vidas Impactadas" },
  { value: "95%", label: "Transparência" },
];

const appCards = [
  {
    icon: Heart,
    iconBg: "bg-[#F39C12]/15",
    iconColor: "text-[#F39C12]",
    title: "Doar",
    description: "Transforme vidas com sua doação",
    to: "/doar",
    label: "Fazer uma doação",
    variant: "yellow" as const,
  },
  {
    icon: FileText,
    iconBg: "bg-[#1A5276]/10",
    iconColor: "text-[#1A5276]",
    title: "Projetos",
    description: "Projetos em 15 capitais",
    to: "/projetos",
    label: "Ver projetos",
    variant: "outline" as const,
  },
  {
    icon: ShoppingBag,
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-600",
    title: "Marketplace",
    description: "Produtos que apoiam a causa",
    to: "/marketplace",
    label: "Acessar marketplace",
    variant: "outline" as const,
  },
  {
    icon: Award,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    title: "Benefícios",
    description: "Vantagens exclusivas",
    to: "/clube-beneficios",
    label: "Conhecer benefícios",
    variant: "outline" as const,
  },
  {
    icon: Users,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
    title: "Voluntariado",
    description: "Contribua com seu talento",
    to: "/voluntariado",
    label: "Quero ser voluntário",
    variant: "outline" as const,
  },
  {
    icon: Newspaper,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600",
    title: "Notícias",
    description: "Novidades e eventos da APABB",
    to: "/noticias",
    label: "Ver notícias",
    variant: "outline" as const,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <Hero />

        {/* Mobile: metrics strip below hero */}
        <section className="md:hidden bg-gray-50 py-6">
          <div className="grid grid-cols-3 gap-4 px-6">
            {mobileMetrics.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center text-center py-2">
                <span className="text-2xl font-bold text-[#1A5276] leading-none">{value}</span>
                <span className="text-[11px] text-gray-500 mt-1 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile: App-style shortcut grid */}
        <section className="py-5 px-4 bg-gray-50 md:hidden">
          <div className="mb-3 text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">Conheça a APABB</h2>
            <p className="text-gray-500 text-xs">Explore nossas iniciativas</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {appCards.map(({ icon: Icon, iconBg, iconColor, title, description, to }) => (
              <Link key={to} to={to}>
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow text-center h-full min-h-[96px]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 leading-tight">{title}</span>
                  <span className="text-[11px] text-gray-400 leading-tight">{description}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Link to="/associar">
              <Button size="lg" variant="yellow" className="px-8">
                Associar-se à APABB
              </Button>
            </Link>
          </div>
        </section>

        {/* Desktop: Original card grid */}
        <section className="hidden md:block py-16 px-4 bg-background">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Conheça a APABB</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore nossas iniciativas e faça parte da transformação de vidas
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appCards.map(({ icon: Icon, title, description, to, label, variant }) => (
                <Card key={to} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <Icon className="w-10 h-10 text-primary mb-2" />
                    <h3 className="text-lg font-semibold mb-1">{title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{description}</p>
                    <Link to={to}>
                      <Button variant={variant} className="w-full">{label}</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/associar">
                <Button size="lg" variant="yellow">
                  Associar-se à APABB
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
