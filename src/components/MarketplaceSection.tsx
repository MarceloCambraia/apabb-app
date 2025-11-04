import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, ExternalLink, Percent } from "lucide-react";

const partners = [
  {
    id: 1,
    name: "Banco do Brasil",
    category: "Financeiro",
    discount: "5%",
    description: "Produtos e serviços com benefícios exclusivos para doadores",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
    reversal: "2% das vendas revertidos para APABB"
  },
  {
    id: 2,
    name: "Livraria Cultura",
    category: "Educação",
    discount: "10%",
    description: "Livros, cursos e materiais educativos",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    reversal: "3% das vendas revertidos para APABB"
  },
  {
    id: 3,
    name: "Farmácia Popular",
    category: "Saúde",
    discount: "15%",
    description: "Medicamentos e produtos de saúde com desconto",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400",
    reversal: "2% das vendas revertidos para APABB"
  },
  {
    id: 4,
    name: "Tech Store",
    category: "Tecnologia",
    discount: "8%",
    description: "Equipamentos e acessórios de tecnologia assistiva",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
    reversal: "5% das vendas revertidos para APABB"
  },
  {
    id: 5,
    name: "Fitness Plus",
    category: "Esporte",
    discount: "20%",
    description: "Academia e atividades físicas adaptadas",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
    reversal: "3% das vendas revertidos para APABB"
  },
  {
    id: 6,
    name: "Restaurante Sabor",
    category: "Alimentação",
    discount: "12%",
    description: "Refeições e delivery com desconto especial",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    reversal: "2% das vendas revertidos para APABB"
  }
];

export function MarketplaceSection() {
  return (
    <section id="marketplace" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Marketplace Solidário
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Compre e Faça o Bem
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Parceiros que revertem parte das vendas para a APABB. Ao comprar, você também doa!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <Card key={partner.id} className="overflow-hidden shadow-soft hover:shadow-medium transition-smooth">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={partner.image} 
                  alt={partner.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 right-4 gradient-secondary">
                  <Percent className="w-3 h-3 mr-1" />
                  {partner.discount} OFF
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{partner.category}</Badge>
                </div>
                <CardTitle className="text-xl">{partner.name}</CardTitle>
                <CardDescription>{partner.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="w-4 h-4 text-secondary" />
                      <span className="text-muted-foreground">{partner.reversal}</span>
                    </div>
                  </div>

                  <Button variant="donation" className="w-full">
                    <ExternalLink className="w-4 h-4" />
                    Visitar Parceiro
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Ver Todos os Parceiros
          </Button>
        </div>
      </div>
    </section>
  );
}