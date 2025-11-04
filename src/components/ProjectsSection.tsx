import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Heart, Target } from "lucide-react";

const projects = [
  {
    id: 1,
    nucleo: "Brasília - DF",
    title: "Programa de Inclusão Digital",
    description: "Capacitação em tecnologia para jovens e adultos com deficiência",
    beneficiados: 150,
    status: "Em andamento",
    meta: "R$ 50.000",
    arrecadado: "R$ 35.000"
  },
  {
    id: 2,
    nucleo: "São Paulo - SP",
    title: "Esporte Adaptado",
    description: "Atividades esportivas inclusivas para crianças e adolescentes",
    beneficiados: 200,
    status: "Em andamento",
    meta: "R$ 80.000",
    arrecadado: "R$ 65.000"
  },
  {
    id: 3,
    nucleo: "Rio de Janeiro - RJ",
    title: "Arte e Cultura Inclusiva",
    description: "Oficinas de arte, música e teatro para pessoas com deficiência",
    beneficiados: 120,
    status: "Concluído",
    meta: "R$ 40.000",
    arrecadado: "R$ 40.000"
  },
  {
    id: 4,
    nucleo: "Porto Alegre - RS",
    title: "Apoio às Famílias",
    description: "Grupos de apoio e orientação para familiares de pessoas com deficiência",
    beneficiados: 300,
    status: "Em andamento",
    meta: "R$ 60.000",
    arrecadado: "R$ 48.000"
  },
  {
    id: 5,
    nucleo: "Belo Horizonte - MG",
    title: "Qualificação Profissional",
    description: "Cursos e workshops para inserção no mercado de trabalho",
    beneficiados: 180,
    status: "Em andamento",
    meta: "R$ 70.000",
    arrecadado: "R$ 52.000"
  },
  {
    id: 6,
    nucleo: "Fortaleza - CE",
    title: "Mobilidade e Acessibilidade",
    description: "Adequação de espaços e promoção da autonomia",
    beneficiados: 250,
    status: "Em andamento",
    meta: "R$ 90.000",
    arrecadado: "R$ 70.000"
  }
];

export function ProjectsSection() {
  return (
    <section id="projetos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Target className="w-4 h-4 mr-2" />
            Projetos Regionais
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Projetos em Todo o Brasil
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Conheça as iniciativas desenvolvidas pelos nossos núcleos regionais em 15 capitais brasileiras
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const percentual = (parseFloat(project.arrecadado.replace('R$ ', '').replace('.', '')) / 
                               parseFloat(project.meta.replace('R$ ', '').replace('.', ''))) * 100;
            
            return (
              <Card key={project.id} className="shadow-soft hover:shadow-medium transition-smooth">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={project.status === "Concluído" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin className="w-3 h-3" />
                      <span>{project.nucleo}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 text-secondary" />
                      <span><strong>{project.beneficiados}</strong> pessoas beneficiadas</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Arrecadado</span>
                        <span className="font-semibold text-primary">{Math.round(percentual)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="gradient-secondary h-2 rounded-full transition-smooth"
                          style={{ width: `${Math.min(percentual, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{project.arrecadado}</span>
                        <span>{project.meta}</span>
                      </div>
                    </div>

                    <Button variant="donation" className="w-full">
                      <Heart className="w-4 h-4" />
                      Apoiar Projeto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}