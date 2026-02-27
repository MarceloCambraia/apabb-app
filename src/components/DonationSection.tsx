import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, CreditCard, Building2, FileText, Wallet, QrCode,
  User, Mail, Phone, MapPin, Calendar, Loader2, CheckCircle2, AlertCircle, Copy, Check,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  useDonation, 
  formatCurrency, 
  formatCpfCnpj, 
  formatPhone, 
  formatCep, 
  formatCardNumber 
} from "@/hooks/useDonation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const nucleusOptions = [
  { value: "nacional", label: "Nacional" },
  { value: "df", label: "Brasília - DF" },
  { value: "sp", label: "São Paulo - SP" },
  { value: "rj", label: "Rio de Janeiro - RJ" },
  { value: "mg", label: "Belo Horizonte - MG" },
  { value: "rs", label: "Porto Alegre - RS" },
  { value: "ba", label: "Salvador - BA" },
  { value: "pr", label: "Curitiba - PR" },
  { value: "ce", label: "Fortaleza - CE" },
  { value: "pe", label: "Recife - PE" },
  { value: "go", label: "Goiânia - GO" },
  { value: "pa", label: "Belém - PA" },
  { value: "sc", label: "Florianópolis - SC" },
  { value: "es", label: "Vitória - ES" },
  { value: "rn", label: "Natal - RN" },
  { value: "se", label: "Aracaju - SE" },
];

const donationAmounts = [
  { value: 25, label: "R$ 25", tier: "Apoiador" },
  { value: 40, label: "R$ 40", tier: "Parceiro" },
  { value: 60, label: "R$ 60", tier: "Protetor", recommended: true },
  { value: 100, label: "R$ 100", tier: "Anjo" },
];

const paymentMethods = [
  { value: "pix", label: "PIX", icon: QrCode, description: "Pagamento instantâneo" },
  { value: "debit_bb", label: "Débito em Conta BB", icon: Building2, description: "Banco do Brasil" },
  { value: "credit_card", label: "Cartão de Crédito", icon: CreditCard, description: "Visa, Master, Elo" },
  { value: "boleto", label: "Boleto Bancário", icon: FileText, description: "Vencimento em 3 dias" },
  { value: "payroll", label: "Folha de Pagamento", icon: Wallet, description: "Exclusivo aposentados BB" },
];

const genderOptions = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Feminino" },
  { value: "O", label: "Outro" },
];

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const stepLabels = ["Valor", "Pagamento", "Dados Pessoais", "Endereço"];

export function DonationSection() {
  const {
    step,
    selectedAmount,
    paymentMethod,
    isRecurring,
    formData,
    errors,
    isSubmitting,
    setAmount,
    setPaymentMethod,
    setIsRecurring,
    updateFormData,
    fetchAddressByCep,
    submitDonation,
    resetForm,
  } = useDonation();

  const [customAmount, setCustomAmount] = useState("");
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [selectedNucleus, setSelectedNucleus] = useState("");
  const [wizardStep, setWizardStep] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();

  // PIX state
  const [pixLoading, setPixLoading] = useState(false);
  const [pixData, setPixData] = useState<{
    qr_code_base64: string;
    qr_code: string;
    mp_transaction_id: string;
  } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Realtime listener for PIX payment confirmation
  useEffect(() => {
    if (!pixData?.mp_transaction_id) return;

    const channel = supabase
      .channel('pix-payment-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'donations',
        filter: `transaction_id=eq.${pixData.mp_transaction_id}`,
      }, (payload) => {
        if (payload.new && (payload.new as any).payment_status === 'paid') {
          setIsPaid(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pixData?.mp_transaction_id]);

  useEffect(() => {
    if (useCustomAmount && customAmount) {
      const value = parseInt(customAmount.replace(/\D/g, "")) / 100;
      if (value > 0) setAmount(value);
    }
  }, [customAmount, useCustomAmount, setAmount]);

  const isPix = paymentMethod === "pix";
  const totalSteps = isPix ? 3 : 4;
  const progressPercent = (wizardStep / totalSteps) * 100;

  const isStep1Valid = selectedAmount > 0 && !!selectedNucleus;
  const isStep2Valid = !!paymentMethod;
  const isStep3Valid = !!(formData.fullName && formData.cpfCnpj && formData.email && formData.phone && formData.birthDate && formData.gender);
  const isStep4Valid = !!(formData.cep && formData.address && formData.number && formData.neighborhood && formData.city && formData.state);

  const canAdvance = () => {
    switch (wizardStep) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      case 4: return isStep4Valid;
      default: return false;
    }
  };

  const handlePixDonation = async () => {
    setPixLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-pix-payment", {
        body: {
          amount: selectedAmount,
          email: formData.email || user?.email || "doador@apabb.org.br",
          userId: user?.id,
          donorName: formData.fullName,
          cpf: formData.cpfCnpj,
          description: `Doação APABB - ${formData.fullName || "Doador"}`,
          nucleus: selectedNucleus,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Erro ao gerar PIX");
      setPixData({
        qr_code_base64: data.qr_code_base64,
        qr_code: data.qr_code,
        mp_transaction_id: data.mp_transaction_id,
      });
    } catch (err: any) {
      toast({ title: "Erro ao gerar PIX", description: err.message || "Tente novamente", variant: "destructive" });
    } finally {
      setPixLoading(false);
    }
  };

  const handleCopyPix = async () => {
    if (pixData?.qr_code) {
      await navigator.clipboard.writeText(pixData.qr_code);
      setPixCopied(true);
      toast({ title: "Código PIX copiado!" });
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const handleCepBlur = (cep: string) => fetchAddressByCep(cep);

  const handleNext = () => {
    if (wizardStep < totalSteps) setWizardStep(wizardStep + 1);
  };

  const handleBack = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  const handleFullReset = () => {
    setPixData(null);
    setWizardStep(1);
    resetForm();
  };

  // Is this the final step?
  const isFinalStep = wizardStep === totalSteps;
  const isFinalPixStep = isPix && wizardStep === 3;

  // --- Result screens ---
  if (pixData && isPaid) {
    return (
      <section className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto shadow-strong">
            <CardContent className="pt-12 pb-8 space-y-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="w-14 h-14 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Pagamento Confirmado!</h2>
              <p className="text-lg text-muted-foreground max-w-sm mx-auto">
                Muito obrigado pela sua doação de{" "}
                <strong className="text-foreground">
                  {selectedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </strong>
                . Sua contribuição faz a diferença!
              </p>
              <div className="pt-4 space-y-3">
                <Button className="w-full" size="lg" onClick={() => window.location.href = "/"}>
                  Voltar ao Início
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleFullReset}>
                  Fazer Nova Doação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (pixData) {
    return (
      <section className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto shadow-strong">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
                 <h2 className="text-2xl font-bold text-foreground">Falta pouco!</h2>
                 <p className="text-muted-foreground">
                   Escaneie o QR Code ou copie o código para pagar{" "}
                   <strong>{selectedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                 </p>
              </div>
              {pixData.qr_code_base64 && (
                <div className="flex justify-center">
                  <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-64 h-64 rounded-lg border border-border" />
                </div>
              )}
              {pixData.qr_code && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Código Copia e Cola</Label>
                  <div className="flex gap-2">
                    <Input value={pixData.qr_code} readOnly className="text-xs font-mono" onClick={(e) => (e.target as HTMLInputElement).select()} />
                    <Button variant="outline" size="icon" onClick={handleCopyPix} className="shrink-0">
                      {pixCopied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Aguardando confirmação do pagamento...</span>
              </div>
              <p className="text-xs text-center text-muted-foreground">ID da transação: {pixData.mp_transaction_id}</p>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = "/"}>Voltar ao Início</Button>
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleFullReset}>Fazer Nova Doação</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (step === "success") {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto text-center shadow-strong">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Doação Registrada!</h2>
              <p className="text-muted-foreground mb-6">Obrigado por apoiar a APABB. Você receberá um e-mail de confirmação.</p>
              <Button onClick={handleFullReset} variant="outline">Fazer Nova Doação</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (step === "error") {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto text-center shadow-strong">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Erro ao Processar</h2>
              <p className="text-muted-foreground mb-6">Houve um problema ao processar sua doação. Tente novamente.</p>
              <Button onClick={handleFullReset} className="bg-destructive hover:bg-destructive/90">Tentar Novamente</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // --- Wizard ---
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
            <Heart className="w-4 h-4 mr-1" />
            Faça a Diferença
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Apoie a APABB</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sua doação garante apoio contínuo às pessoas com deficiência e suas famílias
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-strong">
          <CardContent className="p-6 md:p-8">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">
                  Passo {wizardStep} de {totalSteps}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stepLabels[wizardStep - 1]}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              {/* Step dots */}
              <div className="flex justify-between mt-3">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      i + 1 < wizardStep
                        ? "bg-primary text-primary-foreground"
                        : i + 1 === wizardStep
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1 < wizardStep ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-[10px] hidden md:block ${i + 1 === wizardStep ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {stepLabels[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Valor */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-foreground">Escolha o Valor</h3>
                <div className="grid grid-cols-2 gap-3">
                  {donationAmounts.map((amount) => (
                    <button
                      key={amount.value}
                      onClick={() => { setAmount(amount.value); setUseCustomAmount(false); }}
                      className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        selectedAmount === amount.value && !useCustomAmount
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border hover:border-primary/50"
                      } ${amount.recommended ? "ring-2 ring-secondary ring-offset-2" : ""}`}
                    >
                      {amount.recommended && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
                          Recomendado
                        </span>
                      )}
                      <div className="text-xl font-bold text-foreground">{amount.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{amount.tier}</div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="customAmount" checked={useCustomAmount} onChange={(e) => setUseCustomAmount(e.target.checked)} className="w-4 h-4 rounded border-primary text-primary" />
                  <Label htmlFor="customAmount" className="text-sm">Outro valor:</Label>
                  <Input type="text" placeholder="R$ 0,00" value={customAmount} onChange={(e) => setCustomAmount(formatCurrency(e.target.value))} disabled={!useCustomAmount} className="max-w-[150px]" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Destino da Doação (Núcleo) *</Label>
                  <Select value={selectedNucleus} onValueChange={setSelectedNucleus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o núcleo" />
                    </SelectTrigger>
                    <SelectContent>
                      {nucleusOptions.map((n) => (
                        <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <input type="checkbox" id="recurring" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-5 h-5 rounded border-primary text-primary" />
                  <Label htmlFor="recurring" className="flex-1">
                    <span className="font-medium">Doação Mensal Recorrente</span>
                    <p className="text-sm text-muted-foreground">Doadores recorrentes têm acesso ao Clube de Benefícios APABB</p>
                  </Label>
                </div>
              </div>
            )}

            {/* Step 2: Forma de Pagamento */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-foreground">Forma de Doação</h3>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 gap-3">
                  {paymentMethods.map((method) => (
                    <Label
                      key={method.value}
                      htmlFor={method.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === method.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={method.value} id={method.value} />
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <method.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{method.label}</div>
                        <div className="text-xs text-muted-foreground">{method.description}</div>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>

                {/* Credit card fields inline */}
                {paymentMethod === "credit_card" && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                    <h4 className="font-medium text-foreground flex items-center gap-2"><CreditCard className="w-4 h-4" /> Dados do Cartão</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="cardName">Nome no Cartão</Label>
                        <Input id="cardName" placeholder="NOME COMO ESTÁ NO CARTÃO" value={formData.cardName || ""} onChange={(e) => updateFormData({ cardName: e.target.value.toUpperCase() })} className="uppercase" />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <Input id="cardNumber" placeholder="0000 0000 0000 0000" value={formData.cardNumber || ""} onChange={(e) => updateFormData({ cardNumber: formatCardNumber(e.target.value) })} maxLength={19} />
                      </div>
                      <div>
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input id="cardCvv" placeholder="000" value={formData.cardCvv || ""} onChange={(e) => updateFormData({ cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} maxLength={4} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="cardExpiryMonth">Mês</Label>
                          <Select value={formData.cardExpiryMonth || ""} onValueChange={(v) => updateFormData({ cardExpiryMonth: v })}>
                            <SelectTrigger><SelectValue placeholder="Mês" /></SelectTrigger>
                            <SelectContent>{Array.from({ length: 12 }, (_, i) => (<SelectItem key={i + 1} value={String(i + 1).padStart(2, "0")}>{String(i + 1).padStart(2, "0")}</SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="cardExpiryYear">Ano</Label>
                          <Select value={formData.cardExpiryYear || ""} onValueChange={(v) => updateFormData({ cardExpiryYear: v })}>
                            <SelectTrigger><SelectValue placeholder="Ano" /></SelectTrigger>
                            <SelectContent>{Array.from({ length: 10 }, (_, i) => { const y = new Date().getFullYear() + i; return <SelectItem key={y} value={String(y)}>{y}</SelectItem>; })}</SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">🔒 Seus dados são criptografados e não armazenados localmente</p>
                  </div>
                )}

                {/* BB debit fields inline */}
                {paymentMethod === "debit_bb" && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                    <h4 className="font-medium text-foreground flex items-center gap-2"><Building2 className="w-4 h-4" /> Dados Bancários - Banco do Brasil</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bankAgency">Agência</Label>
                        <Input id="bankAgency" placeholder="0000-0" value={formData.bankAgency || ""} onChange={(e) => updateFormData({ bankAgency: e.target.value.replace(/\D/g, "").slice(0, 5) })} />
                      </div>
                      <div>
                        <Label htmlFor="bankAccount">Conta Corrente</Label>
                        <Input id="bankAccount" placeholder="00000-0" value={formData.bankAccount || ""} onChange={(e) => updateFormData({ bankAccount: e.target.value.replace(/\D/g, "").slice(0, 8) })} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Dados Pessoais */}
            {wizardStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-foreground">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2"><User className="w-4 h-4" /> Nome Completo</Label>
                    <Input id="fullName" placeholder="Seu nome completo" value={formData.fullName || ""} onChange={(e) => updateFormData({ fullName: e.target.value })} className={errors.fullName ? "border-destructive" : ""} />
                    {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                    <Input id="cpfCnpj" placeholder="000.000.000-00" value={formData.cpfCnpj || ""} onChange={(e) => updateFormData({ cpfCnpj: formatCpfCnpj(e.target.value) })} maxLength={18} className={errors.cpfCnpj ? "border-destructive" : ""} />
                    {errors.cpfCnpj && <p className="text-sm text-destructive mt-1">{errors.cpfCnpj}</p>}
                  </div>
                  <div>
                    <Label htmlFor="birthDate" className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Data de Nascimento</Label>
                    <Input id="birthDate" type="date" value={formData.birthDate || ""} onChange={(e) => updateFormData({ birthDate: e.target.value })} className={errors.birthDate ? "border-destructive" : ""} />
                    {errors.birthDate && <p className="text-sm text-destructive mt-1">{errors.birthDate}</p>}
                  </div>
                  <div>
                    <Label htmlFor="gender">Sexo</Label>
                    <Select value={formData.gender || ""} onValueChange={(v) => updateFormData({ gender: v as "M" | "F" | "O" })}>
                      <SelectTrigger className={errors.gender ? "border-destructive" : ""}><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{genderOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4" /> E-mail</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" value={formData.email || ""} onChange={(e) => updateFormData({ email: e.target.value })} className={errors.email ? "border-destructive" : ""} />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4" /> Telefone</Label>
                    <Input id="phone" placeholder="(00) 00000-0000" value={formData.phone || ""} onChange={(e) => updateFormData({ phone: formatPhone(e.target.value) })} maxLength={15} className={errors.phone ? "border-destructive" : ""} />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Endereço (only for non-PIX) */}
            {wizardStep === 4 && !isPix && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-foreground">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep" className="flex items-center gap-2"><MapPin className="w-4 h-4" /> CEP</Label>
                    <Input id="cep" placeholder="00000-000" value={formData.cep || ""} onChange={(e) => updateFormData({ cep: formatCep(e.target.value) })} onBlur={(e) => handleCepBlur(e.target.value)} maxLength={9} className={errors.cep ? "border-destructive" : ""} />
                    {errors.cep && <p className="text-sm text-destructive mt-1">{errors.cep}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" placeholder="Rua, Avenida..." value={formData.address || ""} onChange={(e) => updateFormData({ address: e.target.value })} className={errors.address ? "border-destructive" : ""} />
                    {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" placeholder="123" value={formData.number || ""} onChange={(e) => updateFormData({ number: e.target.value })} className={errors.number ? "border-destructive" : ""} />
                    {errors.number && <p className="text-sm text-destructive mt-1">{errors.number}</p>}
                  </div>
                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input id="complement" placeholder="Apto, Bloco..." value={formData.complement || ""} onChange={(e) => updateFormData({ complement: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" placeholder="Bairro" value={formData.neighborhood || ""} onChange={(e) => updateFormData({ neighborhood: e.target.value })} className={errors.neighborhood ? "border-destructive" : ""} />
                    {errors.neighborhood && <p className="text-sm text-destructive mt-1">{errors.neighborhood}</p>}
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" placeholder="Cidade" value={formData.city || ""} onChange={(e) => updateFormData({ city: e.target.value })} className={errors.city ? "border-destructive" : ""} />
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Select value={formData.state || ""} onValueChange={(v) => updateFormData({ state: v })}>
                      <SelectTrigger className={errors.state ? "border-destructive" : ""}><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>{brazilianStates.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              {wizardStep > 1 ? (
                <Button variant="ghost" onClick={handleBack} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </Button>
              ) : (
                <div />
              )}

              {isFinalStep || isFinalPixStep ? (
                <Button
                  size="lg"
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-base md:text-lg px-6 py-5"
                  onClick={isPix ? handlePixDonation : submitDonation}
                  disabled={(isSubmitting || pixLoading) || !canAdvance()}
                >
                  {(isSubmitting || pixLoading) ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {pixLoading ? "Gerando PIX..." : "Processando..."}
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      {isPix 
                        ? `Gerar PIX de ${selectedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                        : `Enviar Doação de ${selectedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}${isRecurring ? "/mês" : ""}`
                      }
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canAdvance()} className="gap-2">
                  Próximo <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              🔒 Seus dados são protegidos e criptografados. Dados sensíveis nunca são armazenados localmente.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
