import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Star, ShoppingBag, Coffee, Car, Home, Heart, Trophy } from "lucide-react";

const partnerCompanies = [
  {
    name: "Restaurante Sabor & Arte",
    logo: "🍽️",
    category: "Alimentação",
    benefit: "15% de desconto",
    description: "Desconto em todas as refeições"
  },
  {
    name: "AutoCenter Premium",
    logo: "🚗", 
    category: "Automotivo",
    benefit: "20% de desconto",
    description: "Manutenção e serviços automotivos"
  },
  {
    name: "Café Central",
    logo: "☕",
    category: "Cafeteria", 
    benefit: "10% de desconto",
    description: "Cafés especiais e lanches"
  },
  {
    name: "Casa & Decoração",
    logo: "🏠",
    category: "Casa",
    benefit: "25% de desconto",
    description: "Móveis e itens de decoração"
  },
  {
    name: "Moda Elegante",
    logo: "👗",
    category: "Vestuário",
    benefit: "30% de desconto",
    description: "Roupas e acessórios"
  },
  {
    name: "Saúde Total",
    logo: "🏥",
    category: "Saúde",
    benefit: "15% de desconto",
    description: "Consultas e exames"
  }
];

export function ClubeBenefits() {
  return (
    <section id="clube" className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
            <Trophy className="w-4 h-4 mr-1" />
            Exclusivo para Doadores
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Clube do Doador
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Doadores recorrentes têm acesso a benefícios exclusivos em empresas parceiras da APABB
          </p>
        </div>

        {/* Hero Card do Clube */}
        <Card className="max-w-4xl mx-auto mb-16 gradient-card shadow-strong">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-secondary/20 p-4 rounded-full">
                <Gift className="w-8 h-8 text-secondary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Benefícios Exclusivos
            </CardTitle>
            <CardDescription className="text-lg">
              Sua doação mensal te garante acesso ao nosso clube de vantagens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <Star className="w-8 h-8 text-secondary mb-3" />
                <h3 className="font-semibold mb-2">Descontos Exclusivos</h3>
                <p className="text-sm text-muted-foreground">
                  Até 30% de desconto em produtos e serviços
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ShoppingBag className="w-8 h-8 text-secondary mb-3" />
                <h3 className="font-semibold mb-2">Parcerias Premium</h3>
                <p className="text-sm text-muted-foreground">
                  Acesso a mais de 50 empresas parceiras
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Heart className="w-8 h-8 text-secondary mb-3" />
                <h3 className="font-semibold mb-2">Impacto Garantido</h3>
                <p className="text-sm text-muted-foreground">
                  Sua doação mensal gera impacto contínuo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Empresas Parceiras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnerCompanies.map((company, index) => (
            <Card key={index} className="hover:scale-105 transition-smooth shadow-soft hover:shadow-medium">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{company.logo}</div>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {company.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-secondary">
                    {company.benefit}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {company.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Benefício
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA para se tornar doador */}
        <div className="text-center mt-16">
          <Card className="max-w-md mx-auto gradient-secondary shadow-medium">
            <CardContent className="p-8">
              <Trophy className="w-12 h-12 text-secondary-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4 text-secondary-foreground">
                Quero fazer parte!
              </h3>
              <p className="text-secondary-foreground/80 mb-6">
                Torne-se um doador recorrente e tenha acesso a todos esses benefícios
              </p>
              <Button variant="default" size="lg" className="w-full">
                <Heart className="w-4 h-4" />
                Começar a Doar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}