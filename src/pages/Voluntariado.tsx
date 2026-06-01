import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NUCLEUS_NAMES, NUCLEUS_OPTIONS } from "@/lib/volunteer-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  HandHeart,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  UserPlus,
  GraduationCap,
  Smile,
  Trophy,
  Heart,
  Stethoscope,
  Music,
  BookOpen,
  Briefcase,
  Star,
  Target,
  ChevronDown,
} from "lucide-react";

const VOLUNTEER_INTEREST_AREAS = [
  { value: "esporte", label: "Esporte" },
  { value: "lazer", label: "Lazer" },
  { value: "capacitacao", label: "Capacitação Profissional" },
  { value: "familias", label: "Apoio às Famílias" },
  { value: "administrativo", label: "Administrativo" },
  { value: "outros", label: "Outros" },
];

function getCategoryIcon(title = "", description = "") {
  const text = (title + " " + description).toLowerCase();
  if (text.match(/esport|futebol|natação|corrida|atletism|basquete|volei/)) return Trophy;
  if (text.match(/lazer|recreação|passeio|excursão|diversão/)) return Smile;
  if (text.match(/capacitação|profissional|trabalho|emprego|curso|treinamento/)) return GraduationCap;
  if (text.match(/famil|pais|mães|cuidador|apoio/)) return Heart;
  if (text.match(/saúde|médic|terapia|fisio|reabilit/)) return Stethoscope;
  if (text.match(/cultura|arte|música|dança|teatro|criatividade/)) return Music;
  if (text.match(/educação|escola|aprendizagem|leitura/)) return BookOpen;
  if (text.match(/admin|gestão|organização|financeiro/)) return Briefcase;
  return Star;
}

const EMPTY_FORM = { name: "", email: "", phone: "", nucleus: "", area: "", message: "" };

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Voluntariado() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [confirmOpportunity, setConfirmOpportunity] = useState<any | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["public-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "ativo")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: opportunities, isLoading: oppsLoading } = useQuery({
    queryKey: ["public-volunteer-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteer_opportunities")
        .select("*")
        .eq("status", "ativo")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myOppRegistrations } = useQuery({
    queryKey: ["my-volunteer-registrations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("volunteer_opportunity_registrations")
        .select("opportunity_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((r) => r.opportunity_id);
    },
    enabled: !!user,
  });

  const registerOppMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      if (!user) throw new Error("Login necessário");
      const { error } = await supabase
        .from("volunteer_opportunity_registrations")
        .insert({ opportunity_id: opportunityId, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-volunteer-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["public-volunteer-opportunities"] });
      setConfirmOpportunity(null);
      toast({ title: "Inscrição realizada com sucesso!" });
    },
    onError: (err: any) =>
      toast({ title: "Erro na inscrição", description: err.message, variant: "destructive" }),
  });

  const handleOppRegister = (opp: any) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setConfirmOpportunity(opp);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nucleus || !formData.area) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("volunteers").insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          nucleus: formData.nucleus,
          interest_area: formData.area,
          message: formData.message || null,
          status: "pendente",
        },
      ]);
      if (error) throw error;
      toast({
        title: "Cadastro realizado!",
        description: "Entraremos em contato em breve.",
      });
      setFormData(EMPTY_FORM);
    } catch (error: any) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">

        {/* ── Seção 1: Hero ── */}
        <section
          className="py-24 px-4 text-white text-center"
          style={{ background: "linear-gradient(135deg, #1A5276 0%, #1F618D 100%)" }}
        >
          <div className="container mx-auto max-w-3xl">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <HandHeart className="w-4 h-4 mr-2" />
              Voluntariado APABB
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Faça parte da nossa rede de voluntários
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto">
              Contribua com seu tempo e talento para transformar vidas de pessoas com deficiência em todo o Brasil
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-white text-[#1A5276] border-2 border-white px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2"
                onClick={() => scrollTo("oportunidades")}
              >
                Ver Oportunidades
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                className="bg-[#F39C12] hover:bg-[#E67E22] text-white border-0 px-6 py-3 rounded-full font-semibold transition-colors inline-flex items-center justify-center gap-2"
                onClick={() => scrollTo("cadastro")}
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar-se
              </button>
            </div>
          </div>
        </section>

        {/* ── Seção 2: Programas e Projetos ── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Target className="w-4 h-4 mr-2" />
                Programas e Projetos
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nossos Programas e Projetos
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Conheça as iniciativas da APABB e como você pode contribuir
              </p>
            </div>

            {projectsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-52" />
                ))}
              </div>
            ) : !projects?.length ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhum programa disponível no momento.
              </p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {projects.map((project) => {
                  const Icon = getCategoryIcon(project.title, project.description);
                  return (
                    <Card
                      key={project.id}
                      className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                    >
                      <CardHeader className="pb-2 pt-5 px-4">
                        <div className="flex flex-col items-center text-center gap-3 mb-1">
                          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Icon className="w-7 h-7 text-blue-700" />
                          </div>
                          <div className="w-full">
                            <CardTitle className="text-sm font-bold leading-tight mb-1">
                              {project.title}
                            </CardTitle>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              <MapPin className="w-2.5 h-2.5 mr-0.5" />
                              {NUCLEUS_NAMES[project.nucleus] || project.nucleus}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-3 text-xs text-center">
                          {project.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto pt-2 pb-4 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-8"
                          onClick={() => setSelectedProject(project)}
                        >
                          Saiba Mais
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Seção 3: Oportunidades de Voluntariado ── */}
        <section id="oportunidades" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Users className="w-4 h-4 mr-2" />
                Oportunidades
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Oportunidades Abertas
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Vagas disponíveis para voluntários agora
              </p>
            </div>

            {oppsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : !opportunities?.length ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhuma oportunidade aberta no momento.
              </p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {opportunities.map((opp) => {
                  const isRegistered = myOppRegistrations?.includes(opp.id);
                  const filled = (opp as any).filled_slots ?? 0;
                  const max = opp.max_slots;
                  const progress = max ? Math.min((filled / max) * 100, 100) : 0;
                  return (
                    <Card
                      key={opp.id}
                      className="shadow-soft hover:shadow-medium transition-smooth flex flex-col"
                    >
                      {opp.image_url && (
                        <div className="h-40 overflow-hidden rounded-t-lg">
                          <img
                            src={opp.image_url}
                            alt={opp.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <Badge variant="secondary" className="text-xs w-fit mb-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {NUCLEUS_NAMES[opp.nucleus] || opp.nucleus}
                        </Badge>
                        <CardTitle className="text-base leading-tight">{opp.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">
                          {opp.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto pt-0 space-y-3">
                        {opp.time_commitment && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>{opp.time_commitment}</span>
                          </div>
                        )}
                        {max && (
                          <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Vagas</span>
                              <span>
                                {filled}/{max}
                              </span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>
                        )}
                        {isRegistered ? (
                          <Button variant="outline" className="w-full" disabled>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Inscrito ✓
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-[#1A5276] hover:bg-[#154360] text-white border-0"
                            onClick={() => handleOppRegister(opp)}
                            disabled={registerOppMutation.isPending}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Quero me Inscrever
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Seção 4: Formulário de Cadastro Geral ── */}
        <section id="cadastro" className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <HandHeart className="w-4 h-4 mr-2" />
                Cadastro
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Seja um Voluntário APABB
              </h2>
              <p className="text-muted-foreground text-lg">
                Preencha o formulário e entraremos em contato com as oportunidades do seu núcleo
              </p>
            </div>

            <Card className="shadow-medium">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="vol-name">Nome Completo *</Label>
                      <Input
                        id="vol-name"
                        value={formData.name}
                        onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vol-email">E-mail *</Label>
                      <Input
                        id="vol-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vol-phone">Telefone/WhatsApp *</Label>
                      <Input
                        id="vol-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vol-nucleus">Núcleo de Interesse *</Label>
                      <Select
                        value={formData.nucleus}
                        onValueChange={(v) => setFormData((f) => ({ ...f, nucleus: v }))}
                      >
                        <SelectTrigger id="vol-nucleus" className="mt-1">
                          <SelectValue placeholder="Selecione um núcleo" />
                        </SelectTrigger>
                        <SelectContent>
                          {NUCLEUS_OPTIONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vol-area">Área de Interesse *</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(v) => setFormData((f) => ({ ...f, area: v }))}
                    >
                      <SelectTrigger id="vol-area" className="mt-1">
                        <SelectValue placeholder="Selecione uma área" />
                      </SelectTrigger>
                      <SelectContent>
                        {VOLUNTEER_INTEREST_AREAS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vol-message">Mensagem / Motivação</Label>
                    <Textarea
                      id="vol-message"
                      value={formData.message}
                      onChange={(e) => setFormData((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Conte-nos sobre suas experiências, habilidades e motivação..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#F39C12] hover:bg-[#E67E22] text-white border-0"
                    disabled={isSubmitting}
                  >
                    <HandHeart className="w-5 h-5 mr-2" />
                    {isSubmitting ? "Cadastrando..." : "Cadastrar como Voluntário"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
      <BottomNav />

      {/* Modal: Saiba Mais sobre Programa */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
            <DialogDescription asChild>
              <div>
                <Badge variant="secondary" className="text-xs mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {NUCLEUS_NAMES[selectedProject?.nucleus] || selectedProject?.nucleus}
                </Badge>
              </div>
            </DialogDescription>
          </DialogHeader>
          {selectedProject?.image_url && (
            <img
              src={selectedProject.image_url}
              alt={selectedProject.title}
              className="w-full h-48 object-cover rounded-md"
            />
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {selectedProject?.description}
          </p>
          {selectedProject?.max_slots && (
            <p className="text-sm text-muted-foreground">
              Vagas disponíveis: {selectedProject.max_slots}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProject(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar Inscrição em Oportunidade */}
      <Dialog open={!!confirmOpportunity} onOpenChange={() => setConfirmOpportunity(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Inscrição</DialogTitle>
            <DialogDescription>
              Deseja se inscrever na oportunidade{" "}
              <strong>{confirmOpportunity?.title}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setConfirmOpportunity(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                confirmOpportunity && registerOppMutation.mutate(confirmOpportunity.id)
              }
              disabled={registerOppMutation.isPending}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {registerOppMutation.isPending ? "Confirmando..." : "Confirmar Inscrição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
