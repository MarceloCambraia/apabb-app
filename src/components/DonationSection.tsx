import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Repeat, CreditCard, Heart, Gift, ExternalLink, Copy, Check, QrCode, Banknote, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import qrCodePix from "@/assets/qrcode-pix-apabb.png";

const donationOptions = [
  {
    amount: "25",
    description: "Apoiador",
    isRecommended: false
  },
  {
    amount: "40",
    description: "Parceiro",
    isRecommended: false
  },
  {
    amount: "60",
    description: "Protetor",
    isRecommended: true
  },
  {
    amount: "100",
    description: "Anjo",
    isRecommended: false
  }
];

const APABB_PIX_KEY = "58.106.519/0001-39";
const APABB_DONATION_URL = "https://www.apabb.org.br/quero-doar.html#ser-mantenedor";

export function DonationSection() {
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(APABB_PIX_KEY);
      setCopied(true);
      toast({
        title: "Chave PIX copiada!",
        description: "Cole no seu aplicativo bancário para fazer a doação.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Por favor, copie manualmente: " + APABB_PIX_KEY,
        variant: "destructive"
      });
    }
  };

  const handleOpenApabbSite = () => {
    window.open(APABB_DONATION_URL, "_blank", "noopener,noreferrer");
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
            Sua doação garante apoio contínuo às pessoas com deficiência e suas famílias
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Seção PIX */}
          <Card className="shadow-medium border-2 border-primary/20 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Doação via PIX</CardTitle>
                  <CardDescription>Rápido e sem taxas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Valores sugeridos */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Valores sugeridos para doação mensal:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {donationOptions.map((option) => (
                    <button
                      key={option.amount}
                      onClick={() => setSelectedAmount(option.amount)}
                      className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedAmount === option.amount
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      } ${option.isRecommended ? "ring-2 ring-secondary ring-offset-2" : ""}`}
                    >
                      {option.isRecommended && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                          Recomendado
                        </span>
                      )}
                      <div className="text-lg font-bold text-foreground">R$ {option.amount}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center bg-white rounded-xl p-4 border">
                <img 
                  src={qrCodePix} 
                  alt="QR Code PIX APABB" 
                  className="w-48 h-48 object-contain"
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Escaneie o QR Code com o app do seu banco
                </p>
              </div>

              {/* Chave PIX */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Ou copie a chave PIX (CNPJ):
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-4 py-3 rounded-lg text-sm font-mono text-foreground">
                    {APABB_PIX_KEY}
                  </code>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleCopyPix}
                    className="h-12 w-12"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">Como doar via PIX:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Abra o app do seu banco</li>
                  <li>Acesse a opção PIX</li>
                  <li>Escaneie o QR Code ou cole a chave</li>
                  <li>Informe o valor e confirme</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Outras formas de pagamento */}
          <Card className="shadow-medium overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/5 to-primary/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Outras Formas</CardTitle>
                  <CardDescription>Mais opções de pagamento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <p className="text-muted-foreground">
                Acesse o site oficial da APABB para mais opções de doação:
              </p>

              {/* Lista de opções disponíveis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span className="text-sm">Cartão de Crédito</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Banknote className="w-5 h-5 text-primary" />
                  <span className="text-sm">Boleto Bancário</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="text-sm">Débito em Conta BB</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Repeat className="w-5 h-5 text-primary" />
                  <span className="text-sm">Doação Recorrente</span>
                </div>
              </div>

              {/* Dados bancários */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <p className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Dados Bancários - Banco do Brasil
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Agência: <span className="font-mono text-foreground">3324-3</span></p>
                  <p>Conta Corrente: <span className="font-mono text-foreground">456700-5</span></p>
                  <p>CNPJ: <span className="font-mono text-foreground">58.106.519/0001-39</span></p>
                </div>
              </div>

              {/* Botão para site externo */}
              <Button 
                variant="donation" 
                size="lg" 
                className="w-full"
                onClick={handleOpenApabbSite}
              >
                <ExternalLink className="w-5 h-5" />
                Acessar Site de Doações
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Você será redirecionado para o site oficial da APABB
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefícios Clube do Doador */}
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
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full">
                <CreditCard className="w-4 h-4 text-secondary" />
                <span>Descontos exclusivos</span>
              </div>
              <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full">
                <Heart className="w-4 h-4 text-secondary" />
                <span>Certificado de doador</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
