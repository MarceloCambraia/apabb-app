import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, CheckCircle2, Users, Heart, Shield } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const benefits = [
  "Acesso prioritário a eventos e atividades",
  "Descontos no Clube do Doador",
  "Participação em grupos de apoio",
  "Orientação e suporte especializado",
  "Rede de contatos e networking",
  "Atendimento multiprofissional"
];

export function AssociateSignupSection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    nucleo: "",
    relationship: "",
    acceptTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast({
        title: "Atenção",
        description: "Você precisa aceitar os termos e condições.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('associates')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            cpf: formData.cpf,
            birth_date: formData.birthDate,
            phone: formData.phone,
            cep: formData.cep,
            address: formData.address,
            number: formData.number,
            complement: formData.complement || null,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            nucleus: formData.nucleo,
            relationship: formData.relationship,
            accept_terms: formData.acceptTerms
          }
        ]);

      if (error) throw error;

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Em breve você receberá um e-mail de confirmação.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        birthDate: "",
        cep: "",
        address: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        nucleo: "",
        relationship: "",
        acceptTerms: false
      });
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
    <section id="associar" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <UserPlus className="w-4 h-4 mr-2" />
            Cadastro de Associados
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Torne-se um Associado
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Faça parte da família APABB e tenha acesso a todos os nossos benefícios e serviços
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Benefícios */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle>Benefícios de Associado</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-secondary" />
                  <CardTitle className="text-lg">Quem pode se associar?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Pessoas com deficiência</li>
                  <li>• Pais e familiares</li>
                  <li>• Funcionários do Banco do Brasil</li>
                  <li>• Membros da comunidade</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-soft gradient-primary text-primary-foreground">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <CardTitle className="text-lg">Gratuito e Sem Compromisso</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary-foreground/90">
                  A associação é totalmente gratuita e você pode cancelar a qualquer momento.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-2xl">Formulário de Cadastro</CardTitle>
                <CardDescription>
                  Preencha seus dados para se tornar um associado APABB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="birthDate">Data de Nascimento *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cep">CEP *</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                        placeholder="00000-000"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Endereço *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={formData.complement}
                        onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">Acre</SelectItem>
                          <SelectItem value="AL">Alagoas</SelectItem>
                          <SelectItem value="AP">Amapá</SelectItem>
                          <SelectItem value="AM">Amazonas</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="MA">Maranhão</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="PA">Pará</SelectItem>
                          <SelectItem value="PB">Paraíba</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="PI">Piauí</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="RO">Rondônia</SelectItem>
                          <SelectItem value="RR">Roraima</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="SE">Sergipe</SelectItem>
                          <SelectItem value="TO">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="nucleo">Núcleo APABB *</Label>
                      <Select value={formData.nucleo} onValueChange={(value) => setFormData({ ...formData, nucleo: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
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
                      <Label htmlFor="relationship">Vínculo *</Label>
                      <Select value={formData.relationship} onValueChange={(value) => setFormData({ ...formData, relationship: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcd">Pessoa com Deficiência</SelectItem>
                          <SelectItem value="pai">Pai/Mãe</SelectItem>
                          <SelectItem value="familiar">Familiar</SelectItem>
                          <SelectItem value="bb">Funcionário BB</SelectItem>
                          <SelectItem value="comunidade">Comunidade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      Concordo com os termos e condições e autorizo o uso dos meus dados conforme a LGPD
                    </Label>
                  </div>

                  <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isSubmitting}>
                    <Heart className="w-5 h-5" />
                    {isSubmitting ? "Cadastrando..." : "Finalizar Cadastro"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}