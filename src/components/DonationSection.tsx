import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, CreditCard, Building2, FileText, Wallet, QrCode,
  User, Mail, Phone, MapPin, Calendar, Loader2, CheckCircle2, AlertCircle, Copy, Check
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

  // Atualiza o valor quando digita valor customizado
  useEffect(() => {
    if (useCustomAmount && customAmount) {
      const value = parseInt(customAmount.replace(/\D/g, "")) / 100;
      if (value > 0) {
        setAmount(value);
      }
    }
  }, [customAmount, useCustomAmount, setAmount]);

  const handlePixDonation = async () => {
    setPixLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-pix-payment", {
        body: {
          amount: selectedAmount,
          email: formData.email || user?.email || "doador@apabb.org.br",
          userId: user?.id,
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
      toast({
        title: "Erro ao gerar PIX",
        description: err.message || "Tente novamente",
        variant: "destructive",
      });
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

  const handleCepBlur = (cep: string) => {
    fetchAddressByCep(cep);
  };

  // Show PIX QR Code result
  if (pixData) {
    return (
      <section className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto shadow-strong">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">PIX Gerado!</h2>
                <p className="text-muted-foreground">
                  Escaneie o QR Code ou copie o código para pagar{" "}
                  <strong>{selectedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                </p>
              </div>

              {/* QR Code Image */}
              {pixData.qr_code_base64 && (
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${pixData.qr_code_base64}`}
                    alt="QR Code PIX"
                    className="w-64 h-64 rounded-lg border border-border"
                  />
                </div>
              )}

              {/* Copy & Paste Code */}
              {pixData.qr_code && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Código Copia e Cola</Label>
                  <div className="flex gap-2">
                    <Input
                      value={pixData.qr_code}
                      readOnly
                      className="text-xs font-mono"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyPix}
                      className="shrink-0"
                    >
                      {pixCopied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground">
                ID da transação: {pixData.mp_transaction_id}
              </p>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPixData(null);
                  resetForm();
                }}
              >
                Fazer Nova Doação
              </Button>
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
              <p className="text-muted-foreground mb-6">
                Obrigado por apoiar a APABB. Você receberá um e-mail de confirmação com os próximos passos.
              </p>
              <Button onClick={resetForm} variant="outline">
                Fazer Nova Doação
              </Button>
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
              <p className="text-muted-foreground mb-6">
                Houve um problema ao processar sua doação. Por favor, tente novamente.
              </p>
              <Button onClick={resetForm} className="bg-destructive hover:bg-destructive/90">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
            <Heart className="w-4 h-4 mr-1" />
            Faça a Diferença
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Apoie a APABB
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sua doação garante apoio contínuo às pessoas com deficiência e suas famílias
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-strong">
          <CardContent className="p-6 md:p-8 space-y-8">
            
            {/* 1. Seleção de Valor */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                Escolha o Valor
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {donationAmounts.map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => {
                      setAmount(amount.value);
                      setUseCustomAmount(false);
                    }}
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

              {/* Outro Valor */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="customAmount"
                  checked={useCustomAmount}
                  onChange={(e) => setUseCustomAmount(e.target.checked)}
                  className="w-4 h-4 rounded border-primary text-primary"
                />
                <Label htmlFor="customAmount" className="text-sm">Outro valor:</Label>
                <Input
                  type="text"
                  placeholder="R$ 0,00"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(formatCurrency(e.target.value))}
                  disabled={!useCustomAmount}
                  className="max-w-[150px]"
                />
              </div>

              {/* Toggle Recorrente */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-5 h-5 rounded border-primary text-primary"
                />
                <Label htmlFor="recurring" className="flex-1">
                  <span className="font-medium">Doação Mensal Recorrente</span>
                  <p className="text-sm text-muted-foreground">
                    Doadores recorrentes têm acesso ao Clube de Benefícios APABB
                  </p>
                </Label>
              </div>
            </div>

            <Separator />

            {/* 2. Forma de Doação */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                Forma de Doação
              </h3>
              
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <Label
                    key={method.value}
                    htmlFor={method.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
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

              {errors.paymentMethod && (
                <p className="text-sm text-destructive">{errors.paymentMethod}</p>
              )}

              {/* Campos Dinâmicos - Cartão de Crédito */}
              {paymentMethod === "credit_card" && (
                <div className="mt-4 p-4 bg-muted/30 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Dados do Cartão
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input
                        id="cardName"
                        placeholder="NOME COMO ESTÁ NO CARTÃO"
                        value={formData.cardName || ""}
                        onChange={(e) => updateFormData({ cardName: e.target.value.toUpperCase() })}
                        className="uppercase"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        value={formData.cardNumber || ""}
                        onChange={(e) => updateFormData({ cardNumber: formatCardNumber(e.target.value) })}
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input
                        id="cardCvv"
                        placeholder="000"
                        value={formData.cardCvv || ""}
                        onChange={(e) => updateFormData({ cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        maxLength={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="cardExpiryMonth">Mês</Label>
                        <Select
                          value={formData.cardExpiryMonth || ""}
                          onValueChange={(value) => updateFormData({ cardExpiryMonth: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                                {String(i + 1).padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="cardExpiryYear">Ano</Label>
                        <Select
                          value={formData.cardExpiryYear || ""}
                          onValueChange={(value) => updateFormData({ cardExpiryYear: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = new Date().getFullYear() + i;
                              return (
                                <SelectItem key={year} value={String(year)}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {errors.card && <p className="text-sm text-destructive">{errors.card}</p>}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    🔒 Seus dados são criptografados e não armazenados localmente
                  </p>
                </div>
              )}

              {/* Campos Dinâmicos - Débito BB */}
              {paymentMethod === "debit_bb" && (
                <div className="mt-4 p-4 bg-muted/30 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Dados Bancários - Banco do Brasil
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankAgency">Agência</Label>
                      <Input
                        id="bankAgency"
                        placeholder="0000-0"
                        value={formData.bankAgency || ""}
                        onChange={(e) => updateFormData({ bankAgency: e.target.value.replace(/\D/g, "").slice(0, 5) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankAccount">Conta Corrente</Label>
                      <Input
                        id="bankAccount"
                        placeholder="00000-0"
                        value={formData.bankAccount || ""}
                        onChange={(e) => updateFormData({ bankAccount: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                      />
                    </div>
                  </div>
                  {errors.bank && <p className="text-sm text-destructive">{errors.bank}</p>}
                </div>
              )}
            </div>

            <Separator />

            {/* 3. Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                Dados Pessoais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Nome Completo
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Seu nome completo"
                    value={formData.fullName || ""}
                    onChange={(e) => updateFormData({ fullName: e.target.value })}
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                  <Input
                    id="cpfCnpj"
                    placeholder="000.000.000-00"
                    value={formData.cpfCnpj || ""}
                    onChange={(e) => updateFormData({ cpfCnpj: formatCpfCnpj(e.target.value) })}
                    maxLength={18}
                    className={errors.cpfCnpj ? "border-destructive" : ""}
                  />
                  {errors.cpfCnpj && <p className="text-sm text-destructive mt-1">{errors.cpfCnpj}</p>}
                </div>

                <div>
                  <Label htmlFor="birthDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Data de Nascimento
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate || ""}
                    onChange={(e) => updateFormData({ birthDate: e.target.value })}
                    className={errors.birthDate ? "border-destructive" : ""}
                  />
                  {errors.birthDate && <p className="text-sm text-destructive mt-1">{errors.birthDate}</p>}
                </div>

                <div>
                  <Label htmlFor="gender">Sexo</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) => updateFormData({ gender: value as "M" | "F" | "O" })}
                  >
                    <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email || ""}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Telefone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={formData.phone || ""}
                    onChange={(e) => updateFormData({ phone: formatPhone(e.target.value) })}
                    maxLength={15}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            <Separator />

            {/* 4. Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</span>
                Endereço
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cep" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> CEP
                  </Label>
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={formData.cep || ""}
                    onChange={(e) => updateFormData({ cep: formatCep(e.target.value) })}
                    onBlur={(e) => handleCepBlur(e.target.value)}
                    maxLength={9}
                    className={errors.cep ? "border-destructive" : ""}
                  />
                  {errors.cep && <p className="text-sm text-destructive mt-1">{errors.cep}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    placeholder="Rua, Avenida..."
                    value={formData.address || ""}
                    onChange={(e) => updateFormData({ address: e.target.value })}
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                </div>

                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    placeholder="123"
                    value={formData.number || ""}
                    onChange={(e) => updateFormData({ number: e.target.value })}
                    className={errors.number ? "border-destructive" : ""}
                  />
                  {errors.number && <p className="text-sm text-destructive mt-1">{errors.number}</p>}
                </div>

                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Apto, Bloco..."
                    value={formData.complement || ""}
                    onChange={(e) => updateFormData({ complement: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    placeholder="Bairro"
                    value={formData.neighborhood || ""}
                    onChange={(e) => updateFormData({ neighborhood: e.target.value })}
                    className={errors.neighborhood ? "border-destructive" : ""}
                  />
                  {errors.neighborhood && <p className="text-sm text-destructive mt-1">{errors.neighborhood}</p>}
                </div>

                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    value={formData.city || ""}
                    onChange={(e) => updateFormData({ city: e.target.value })}
                    className={errors.city ? "border-destructive" : ""}
                  />
                  {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                </div>

                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    value={formData.state || ""}
                    onValueChange={(value) => updateFormData({ state: value })}
                  >
                    <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                </div>
              </div>
            </div>

            <Separator />

            {/* Botão de Enviar */}
            <div className="pt-4">
              <Button
                size="lg"
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-lg py-6"
                onClick={paymentMethod === "pix" ? handlePixDonation : submitDonation}
                disabled={(isSubmitting || pixLoading) || !paymentMethod}
              >
                {(isSubmitting || pixLoading) ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {pixLoading ? "Gerando PIX..." : "Processando..."}
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Enviar Doação de {selectedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    {isRecurring && "/mês"}
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                🔒 Seus dados são protegidos e criptografados. 
                Dados sensíveis de pagamento nunca são armazenados localmente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
