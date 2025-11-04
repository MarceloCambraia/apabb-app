import { useState } from "react";
import { DonationCard } from "./DonationCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Repeat, CreditCard, Smartphone, Heart, Gift, MapPin } from "lucide-react";

const donationOptions = [
  {
    title: "Apoiador",
    amount: "25",
    description: "Doação mensal",
    impact: "Ajuda 1 pessoa por mês",
    isRecommended: false
  },
  {
    title: "Parceiro",
    amount: "50",
    description: "Doação mensal",
    impact: "Ajuda 2 pessoas por mês",
    isRecommended: true
  },
  {
    title: "Protetor",
    amount: "100",
    description: "Doação mensal",
    impact: "Ajuda 4 pessoas por mês",
    isRecommended: false
  },
  {
    title: "Anjo",
    amount: "200",
    description: "Doação mensal",
    impact: "Ajuda 8 pessoas por mês",
    isRecommended: false
  }
];

export function DonationSection() {
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState(true);
  const [selectedNucleo, setSelectedNucleo] = useState<string>("");

  const handleDonationSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount("");
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
            <Heart className="w-4 h-4 mr-1" />
            Faça a Diferença
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Escolha como ajudar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sua doação recorrente garante apoio contínuo às pessoas com deficiência e suas famílias
          </p>
        </div>

        {/* Toggle para Doação Recorrente */}
        <div className="flex justify-center mb-8">
          <div className="bg-card rounded-lg p-1 border shadow-soft">
            <Button 
              variant={isRecurring ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsRecurring(true)}
              className="transition-smooth"
            >
              <Repeat className="w-4 h-4 mr-2" />
              Doação Mensal
            </Button>
            <Button 
              variant={!isRecurring ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsRecurring(false)}
              className="transition-smooth"
            >
              <Gift className="w-4 h-4 mr-2" />
              Doação Única
            </Button>
          </div>
        </div>

        {/* Seleção de Núcleo Regional */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <Label htmlFor="nucleo" className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="font-semibold">Escolha o núcleo que deseja apoiar</span>
              </Label>
              <Select value={selectedNucleo} onValueChange={setSelectedNucleo}>
                <SelectTrigger id="nucleo">
                  <SelectValue placeholder="Selecione um núcleo regional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Núcleos</SelectItem>
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
            </CardContent>
          </Card>
        </div>

        {/* Cards de Doação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {donationOptions.map((option, index) => (
            <DonationCard
              key={index}
              {...option}
              onSelect={handleDonationSelect}
            />
          ))}
        </div>

        {/* Valor Personalizado */}
        <Card className="max-w-md mx-auto shadow-medium">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Valor Personalizado</CardTitle>
            <CardDescription>
              Defina o valor que deseja doar {isRecurring ? "mensalmente" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="flex items-center text-xl font-semibold text-primary">R$</div>
              <Input
                type="number"
                placeholder="0,00"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="text-lg text-center"
              />
            </div>
            <Button 
              className="w-full" 
              variant="donation"
              disabled={!customAmount && !selectedAmount}
            >
              <Heart className="w-4 h-4" />
              Continuar Doação
            </Button>
          </CardContent>
        </Card>

        {/* Benefícios Clube do Doador */}
        {isRecurring && (
          <div className="mt-16 text-center">
            <div className="gradient-card rounded-2xl p-8 max-w-2xl mx-auto shadow-medium">
              <div className="text-secondary mb-4">
                <Gift className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Clube do Doador Recorrente
              </h3>
              <p className="text-muted-foreground mb-6">
                Doadores mensais têm acesso exclusivo a descontos e benefícios em empresas parceiras
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-secondary" />
                  <span>Descontos exclusivos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-secondary" />
                  <span>App exclusivo</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}