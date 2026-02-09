import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HandHeart, Users, Award, Clock, MapPin, CheckCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const nucleusNames: Record<string, string> = {
  df: 'Brasília - DF', sp: 'São Paulo - SP', rj: 'Rio de Janeiro - RJ',
  mg: 'Belo Horizonte - MG', rs: 'Porto Alegre - RS', ba: 'Salvador - BA',
  pr: 'Curitiba - PR', ce: 'Fortaleza - CE', pe: 'Recife - PE',
  go: 'Goiânia - GO', pa: 'Belém - PA', sc: 'Florianópolis - SC',
  es: 'Vitória - ES', rn: 'Natal - RN', se: 'Aracaju - SE',
};

export function VolunteerSection() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", nucleo: "", area: "", message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch active volunteer opportunities
  const { data: opportunities, isLoading: oppsLoading } = useQuery({
    queryKey: ['public-volunteer-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's registrations
  const { data: myRegistrations } = useQuery({
    queryKey: ['my-volunteer-registrations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('volunteer_opportunity_registrations')
        .select('opportunity_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map((r) => r.opportunity_id);
    },
    enabled: !!user,
  });

  const registerMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      if (!user) throw new Error('Login necessário');
      const { error } = await supabase.from('volunteer_opportunity_registrations').insert({
        opportunity_id: opportunityId,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-volunteer-registrations'] });
      toast({ title: "Inscrição realizada com sucesso!" });
    },
    onError: (err: any) => toast({ title: "Erro na inscrição", description: err.message, variant: "destructive" }),
  });

  const handleRegister = (opportunityId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    registerMutation.mutate(opportunityId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('volunteers')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          nucleus: formData.nucleo,
          interest_area: formData.area,
          message: formData.message || null
        }]);

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

        {/* Oportunidades dinâmicas do banco */}
        {oppsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : opportunities && opportunities.length > 0 ? (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-6">Oportunidades Disponíveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opp) => {
                const isRegistered = myRegistrations?.includes(opp.id);
                return (
                  <Card key={opp.id} className="shadow-soft hover:shadow-medium transition-smooth flex flex-col">
                    {opp.image_url && (
                      <div className="h-48 overflow-hidden rounded-t-lg">
                        <img src={opp.image_url} alt={opp.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Ativo</Badge>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <MapPin className="w-3 h-3" />
                          <span>{nucleusNames[opp.nucleus] || opp.nucleus}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{opp.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{opp.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {opp.time_commitment && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-secondary" />
                            <span>{opp.time_commitment}</span>
                          </div>
                        )}
                        {opp.max_slots && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-secondary" />
                            <span>{opp.max_slots} vagas</span>
                          </div>
                        )}
                      </div>
                      {isRegistered ? (
                        <Button variant="outline" className="w-full" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Inscrição Realizada
                        </Button>
                      ) : (
                        <Button variant="donation" className="w-full" onClick={() => handleRegister(opp.id)} disabled={registerMutation.isPending}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Quero Participar
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Formulário de cadastro geral */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
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
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="nucleo">Núcleo de Interesse</Label>
                    <Select value={formData.nucleo} onValueChange={(value) => setFormData({ ...formData, nucleo: value })}>
                      <SelectTrigger><SelectValue placeholder="Selecione um núcleo" /></SelectTrigger>
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
                      <SelectTrigger><SelectValue placeholder="Selecione uma área" /></SelectTrigger>
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
                    <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Experiências, habilidades, motivação..." rows={4} />
                  </div>
                  <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isSubmitting}>
                    <HandHeart className="w-5 h-5" />
                    {isSubmitting ? "Cadastrando..." : "Cadastrar como Voluntário"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Benefícios */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">Por que ser voluntário?</h3>
            <Card className="text-center shadow-soft">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full gradient-secondary flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle>Certificação</CardTitle>
                <CardDescription>Receba certificados pelas horas de voluntariado realizadas</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center shadow-soft">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full gradient-secondary flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle>Networking</CardTitle>
                <CardDescription>Conecte-se com profissionais e empresas parceiras</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center shadow-soft">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full gradient-secondary flex items-center justify-center mb-4">
                  <HandHeart className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle>Impacto Real</CardTitle>
                <CardDescription>Veja de perto o resultado do seu trabalho na comunidade</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
