import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Target, Users, TrendingUp, DollarSign, Award, Eye, CheckCircle } from "lucide-react";

export function TransparencySection() {
  return (
    <section id="transparencia" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <Shield className="w-4 h-4 mr-1" />
            Transparência Total
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Prestação de Contas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja como suas doações estão transformando vidas e gerando impacto real na comunidade
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center shadow-soft hover:shadow-medium transition-smooth">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-secondary mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground mb-1">R$ 2.8M</div>
              <div className="text-sm text-muted-foreground">Arrecadado em 2024</div>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-soft hover:shadow-medium transition-smooth">
            <CardContent className="p-6">
              <Users className="w-8 h-8 text-secondary mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground mb-1">15.2K</div>
              <div className="text-sm text-muted-foreground">Pessoas beneficiadas</div>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-soft hover:shadow-medium transition-smooth">
            <CardContent className="p-6">
              <Target className="w-8 h-8 text-secondary mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground mb-1">127</div>
              <div className="text-sm text-muted-foreground">Projetos ativos</div>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-soft hover:shadow-medium transition-smooth">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground mb-1">95%</div>
              <div className="text-sm text-muted-foreground">Eficiência dos recursos</div>
            </CardContent>
          </Card>
        </div>

        {/* Uso dos Recursos */}
        <Card className="max-w-4xl mx-auto mb-16 shadow-medium">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Como usamos as doações</CardTitle>
            <CardDescription>
              Distribuição transparente dos recursos arrecadados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Programas de Assistência</span>
                  <span className="text-sm font-semibold">75%</span>
                </div>
                <Progress value={75} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  Apoio direto às famílias e pessoas com deficiência
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Projetos de Inclusão</span>
                  <span className="text-sm font-semibold">15%</span>
                </div>
                <Progress value={15} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  Atividades esportivas, culturais e educacionais
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Custos Administrativos</span>
                  <span className="text-sm font-semibold">10%</span>
                </div>
                <Progress value={10} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  Gestão, tecnologia e estrutura organizacional
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projetos em Destaque */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <Badge variant="secondary">Concluído</Badge>
              </div>
              <CardTitle>Projeto Acessibilidade Digital</CardTitle>
              <CardDescription>
                Capacitação tecnológica para 200 pessoas com deficiência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Meta: R$ 50.000</span>
                  <span className="font-semibold text-green-600">100% atingida</span>
                </div>
                <Progress value={100} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  200 pessoas capacitadas em tecnologia assistiva e inclusão digital
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <Badge>Em andamento</Badge>
              </div>
              <CardTitle>Centro de Reabilitação</CardTitle>
              <CardDescription>
                Construção de novo centro de reabilitação e fisioterapia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Meta: R$ 120.000</span>
                  <span className="font-semibold text-primary">68% atingida</span>
                </div>
                <Progress value={68} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Atenderá 500 pessoas por mês com serviços especializados
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificações e Reconhecimentos */}
        <Card className="max-w-2xl mx-auto gradient-card shadow-medium">
          <CardHeader className="text-center">
            <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
            <CardTitle className="text-xl font-bold">Certificações e Reconhecimentos</CardTitle>
            <CardDescription>
              Transparência e qualidade reconhecidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <Eye className="w-8 h-8 text-secondary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Selo de Transparência</h3>
                <p className="text-xs text-muted-foreground">Instituto Doar</p>
              </div>
              <div>
                <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Certificação Digital</h3>
                <p className="text-xs text-muted-foreground">Governo Federal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}