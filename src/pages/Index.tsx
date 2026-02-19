import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Users, Award, Newspaper, FileText } from "lucide-react";

const appCards = [
  {
    icon: Heart,
    title: "Doar",
    description: "Transforme vidas com sua doação",
    to: "/doar",
    label: "Fazer uma doação",
    variant: "yellow" as const,
  },
  {
    icon: FileText,
    title: "Projetos",
    description: "Projetos em 15 capitais",
    to: "/projetos",
    label: "Ver projetos",
    variant: "outline" as const,
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Produtos que apoiam a causa",
    to: "/marketplace",
    label: "Acessar marketplace",
    variant: "outline" as const,
  },
  {
    icon: Award,
    title: "Benefícios",
    description: "Vantagens exclusivas",
    to: "/clube-beneficios",
    label: "Conhecer benefícios",
    variant: "outline" as const,
  },
  {
    icon: Users,
    title: "Voluntariado",
    description: "Contribua com seu talento",
    to: "/voluntariado",
    label: "Quero ser voluntário",
    variant: "outline" as const,
  },
  {
    icon: Newspaper,
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
        
        {/* Mobile: App-style shortcut grid */}
        <section className="py-8 px-4 bg-background md:hidden">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold mb-1">Conheça a APABB</h2>
            <p className="text-muted-foreground text-sm">Explore nossas iniciativas</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {appCards.map(({ icon: Icon, title, description, to }) => (
              <Link key={to} to={to}>
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border bg-card hover:bg-accent transition-colors text-center h-full min-h-[96px]">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold leading-tight">{title}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">{description}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/associar">
              <Button size="lg" variant="yellow" className="w-full">
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
