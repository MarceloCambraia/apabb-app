import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HandHeart, Users, Award, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const opportunities = [
  {
    id: 1,
    title: "Acompanhamento Educacional",
    description: "Apoie crianças e jovens em atividades educacionais",
    time: "4h por semana",
    volunteers: 15
  },
  {
    id: 2,
    title: "Oficinas de Arte",
    description: "Ensine arte, música ou teatro para nossos beneficiários",
    time: "6h por semana",
    volunteers: 8
  },
  {
    id: 3,
    title: "Apoio Administrativo",
    description: "Ajude na organização e gestão de projetos",
    time: "8h por semana",
    volunteers: 5
  },
  {
    id: 4,
    title: "Eventos e Campanhas",
    description: "Participe da organização de eventos inclusivos",
    time: "Flexível",
    volunteers: 20
  }
];

export function VolunteerSection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nucleo: "",
    area: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('volunteers')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            nucleus: formData.nucleo,
            interest_area: formData.area,
            message: formData.message || null
          }
        ]);

      if (error) throw error;

      toast({
        title: "Cadastro recebido!",
        description: "Em breve entraremos em contato para mais informações.",
      });

      setFormData({ name: "", email: "", phone: "", nucleo: "", area: "", message: "" });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao processar seu cadastro. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="voluntariado" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <HandHeart className="w-4 h-4 mr-2" />
            Voluntariado
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Seja um Voluntário
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Doe seu tempo e talento para transformar vidas. Junte-se à nossa rede de voluntários!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Oportunidades */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">Oportunidades de Voluntariado</h3>
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <Card key={opp.id} className="shadow-soft hover:shadow-medium transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-lg">{opp.title}</CardTitle>
                    <CardDescription>{opp.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span>{opp.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-secondary" />
                        <span>{opp.volunteers} voluntários</span>
                      </div>
                    </div>
                    <Button variant="donation" size="sm" className="w-full">
                      Quero Participar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Formulário */}
          <div>
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-2xl">Cadastre-se como Voluntário</CardTitle>
                <CardDescription>
                  Preencha o formulário e entraremos em contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="nucleo">Núcleo de Interesse</Label>
                    <Select value={formData.nucleo} onValueChange={(value) => setFormData({ ...formData, nucleo: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um núcleo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="df">Brasília - DF</SelectItem>
                        <SelectItem value="sp">São Paulo - SP</SelectItem>
                        <SelectItem value="rj">Rio de Janeiro - RJ</SelectItem>
                        <SelectItem value="mg">Belo Horizonte - MG</SelectItem>
                        <SelectItem value="rs">Porto Alegre - RS</SelectItem>
                        <SelectItem value="ba">Salvador - BA</SelectItem>
                        <SelectItem value="pr">Curitiba - PR</SelectItem>
                        <SelectItem value="ce">Fortaleza - CE</SelectItem>
                        <SelectItem value="pe">Recife - PE</SelectItem>
                        <SelectItem value="go">Goiânia - GO</SelectItem>
                        <SelectItem value="pa">Belém - PA</SelectItem>
                        <SelectItem value="sc">Florianópolis - SC</SelectItem>
                        <SelectItem value="es">Vitória - ES</SelectItem>
                        <SelectItem value="rn">Natal - RN</SelectItem>
                        <SelectItem value="se">Aracaju - SE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="area">Área de Interesse</Label>
                    <Select value={formData.area} onValueChange={(value) => setFormData({ ...formData, area: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="educacao">Educação</SelectItem>
                        <SelectItem value="arte">Arte e Cultura</SelectItem>
                        <SelectItem value="esporte">Esporte</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="administrativo">Administrativo</SelectItem>
                        <SelectItem value="eventos">Eventos</SelectItem>
                        <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Conte-nos sobre você</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Experiências, habilidades, motivação..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isSubmitting}>
                    <HandHeart className="w-5 h-5" />
                    {isSubmitting ? "Cadastrando..." : "Cadastrar como Voluntário"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefícios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center shadow-soft">
            <CardHeader>
              <div className="mx-auto w-12 h-12 rounded-full gradient-secondary flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-secondary-foreground" />
              </div>
              <CardTitle>Certificação</CardTitle>
              <CardDescription>
                Receba certificados pelas horas de voluntariado realizadas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center shadow-soft">
            <CardHeader>
              <div className="mx-auto w-12 h-12 rounded-full gradient-secondary flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary-foreground" />
              </div>
              <CardTitle>Networking</CardTitle>
              <CardDescription>
                Conecte-se com profissionais e empresas parceiras
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center shadow-soft">
            <CardHeader>
              <div className="mx-auto w-12 h-12 rounded-full gradient-secondary flex items-center justify-center mb-4">
                <HandHeart className="w-6 h-6 text-secondary-foreground" />
              </div>
              <CardTitle>Impacto Real</CardTitle>
              <CardDescription>
                Veja de perto o resultado do seu trabalho na comunidade
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}