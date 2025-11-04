import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";

const events = [
  {
    id: 1,
    type: "Evento",
    title: "Workshop de Acessibilidade Digital",
    date: "15 de Dezembro, 2024",
    time: "14h às 18h",
    location: "Brasília - DF",
    description: "Aprenda sobre tecnologias assistivas e ferramentas de inclusão digital",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"
  },
  {
    id: 2,
    type: "Campanha",
    title: "Natal Solidário 2024",
    date: "01 a 25 de Dezembro",
    time: "O dia todo",
    location: "Todos os núcleos",
    description: "Campanha de arrecadação de brinquedos e presentes para crianças com deficiência",
    image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400"
  },
  {
    id: 3,
    type: "Notícia",
    title: "Nova Parceria com Universidade",
    date: "10 de Dezembro, 2024",
    time: "",
    location: "São Paulo - SP",
    description: "APABB firma parceria para pesquisa em tecnologia assistiva",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400"
  }
];

const news = [
  {
    id: 4,
    title: "APABB inaugura novo centro de atendimento em Recife",
    date: "08 de Dezembro, 2024",
    excerpt: "Novo espaço oferecerá atendimento multiprofissional para 200 famílias"
  },
  {
    id: 5,
    title: "Projeto de Inclusão Digital beneficia 150 jovens",
    date: "05 de Dezembro, 2024",
    excerpt: "Iniciativa capacitou jovens em programação e design"
  },
  {
    id: 6,
    title: "APABB recebe prêmio de Organização do Ano",
    date: "01 de Dezembro, 2024",
    excerpt: "Reconhecimento pelo trabalho de inclusão e transparência"
  }
];

export function NewsSection() {
  return (
    <section id="noticias" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            Agenda e Notícias
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Fique Por Dentro
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Acompanhe nossos eventos, campanhas e conquistas
          </p>
        </div>

        {/* Eventos em Destaque */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-6">Próximos Eventos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden shadow-soft hover:shadow-medium transition-smooth">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 gradient-secondary">
                    {event.type}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-secondary" />
                      <span>{event.date}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-secondary" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <Button variant="donation" className="w-full mt-4">
                    Saiba Mais
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Últimas Notícias */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6">Últimas Notícias</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((item) => (
              <Card key={item.id} className="shadow-soft hover:shadow-medium transition-smooth">
                <CardHeader>
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Ler Mais
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Ver Todas as Notícias
          </Button>
        </div>
      </div>
    </section>
  );
}