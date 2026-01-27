import { useState, useCallback } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Validação de CPF/CNPJ
const validateCpfCnpj = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  return numbers.length === 11 || numbers.length === 14;
};

// Schema de validação
export const donationFormSchema = z.object({
  amount: z.number().min(1, "Valor mínimo é R$ 1,00"),
  customAmount: z.string().optional(),
  paymentMethod: z.enum(["debit_bb", "credit_card", "boleto", "payroll"], {
    required_error: "Selecione uma forma de doação",
  }),
  isRecurring: z.boolean().default(true),
  
  // Campos do cartão (opcionais - só validados se credit_card)
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  cardCvv: z.string().optional(),
  cardExpiryMonth: z.string().optional(),
  cardExpiryYear: z.string().optional(),
  
  // Campos débito BB (opcionais - só validados se debit_bb)
  bankAgency: z.string().optional(),
  bankAccount: z.string().optional(),
  
  // Dados pessoais
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpfCnpj: z.string().refine(validateCpfCnpj, "CPF ou CNPJ inválido"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  gender: z.enum(["M", "F", "O"], { required_error: "Selecione o sexo" }),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  
  // Endereço
  cep: z.string().min(8, "CEP inválido"),
  address: z.string().min(3, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado inválido"),
});

export type DonationFormData = z.infer<typeof donationFormSchema>;

export interface DonationState {
  step: "form" | "processing" | "success" | "error";
  selectedAmount: number;
  paymentMethod: string;
  isRecurring: boolean;
  formData: Partial<DonationFormData>;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

const initialState: DonationState = {
  step: "form",
  selectedAmount: 60,
  paymentMethod: "",
  isRecurring: true,
  formData: {},
  errors: {},
  isSubmitting: false,
};

export function useDonation() {
  const [state, setState] = useState<DonationState>(initialState);
  const { toast } = useToast();
  const { user } = useAuth();

  const setAmount = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, selectedAmount: amount }));
  }, []);

  const setPaymentMethod = useCallback((method: string) => {
    setState((prev) => ({ ...prev, paymentMethod: method }));
  }, []);

  const setIsRecurring = useCallback((recurring: boolean) => {
    setState((prev) => ({ ...prev, isRecurring: recurring }));
  }, []);

  const updateFormData = useCallback((data: Partial<DonationFormData>) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...data },
      errors: {},
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const { formData, selectedAmount, paymentMethod, isRecurring } = state;
    
    const dataToValidate = {
      ...formData,
      amount: selectedAmount,
      paymentMethod,
      isRecurring,
    };

    try {
      // Validação condicional para campos de cartão
      if (paymentMethod === "credit_card") {
        if (!formData.cardName || !formData.cardNumber || !formData.cardCvv || 
            !formData.cardExpiryMonth || !formData.cardExpiryYear) {
          setState((prev) => ({
            ...prev,
            errors: { card: "Preencha todos os dados do cartão" },
          }));
          return false;
        }
      }

      // Validação condicional para débito BB
      if (paymentMethod === "debit_bb") {
        if (!formData.bankAgency || !formData.bankAccount) {
          setState((prev) => ({
            ...prev,
            errors: { bank: "Preencha agência e conta" },
          }));
          return false;
        }
      }

      donationFormSchema.parse(dataToValidate);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setState((prev) => ({ ...prev, errors: newErrors }));
      }
      return false;
    }
  }, [state]);

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        updateFormData({
          address: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  }, [updateFormData]);

  const submitDonation = useCallback(async () => {
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, verifique os campos destacados",
        variant: "destructive",
      });
      return;
    }

    setState((prev) => ({ ...prev, step: "processing", isSubmitting: true }));

    try {
      const { formData, selectedAmount, paymentMethod, isRecurring } = state;

      // IMPORTANTE: Nunca envie dados sensíveis do cartão para o banco local
      // Apenas envie para a Edge Function via HTTPS
      const sensitivePaymentData = paymentMethod === "credit_card" 
        ? {
            cardName: formData.cardName,
            cardNumber: formData.cardNumber,
            cardCvv: formData.cardCvv,
            cardExpiryMonth: formData.cardExpiryMonth,
            cardExpiryYear: formData.cardExpiryYear,
          }
        : paymentMethod === "debit_bb"
        ? {
            bankAgency: formData.bankAgency,
            bankAccount: formData.bankAccount,
          }
        : {};

      // Dados seguros para enviar à Edge Function
      const donationPayload = {
        amount: selectedAmount,
        paymentMethod,
        isRecurring,
        donor: {
          fullName: formData.fullName,
          cpfCnpj: formData.cpfCnpj?.replace(/\D/g, ""),
          birthDate: formData.birthDate,
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone?.replace(/\D/g, ""),
        },
        address: {
          cep: formData.cep?.replace(/\D/g, ""),
          address: formData.address,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
        },
        // Dados sensíveis só vão para a Edge Function (HTTPS)
        paymentDetails: sensitivePaymentData,
        userId: user?.id,
      };

      const { data, error } = await supabase.functions.invoke("process-donation", {
        body: donationPayload,
      });

      if (error) throw error;

      setState((prev) => ({ ...prev, step: "success", isSubmitting: false }));
      
      toast({
        title: "Doação registrada!",
        description: "Obrigado por apoiar a APABB. Você receberá um e-mail de confirmação.",
      });

      return data;
    } catch (error) {
      console.error("Erro ao processar doação:", error);
      setState((prev) => ({ ...prev, step: "error", isSubmitting: false }));
      
      toast({
        title: "Erro ao processar doação",
        description: "Por favor, tente novamente ou entre em contato conosco.",
        variant: "destructive",
      });
    }
  }, [state, validateForm, toast, user]);

  const resetForm = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    setAmount,
    setPaymentMethod,
    setIsRecurring,
    updateFormData,
    fetchAddressByCep,
    submitDonation,
    resetForm,
    validateForm,
  };
}

// Máscaras de formatação
export const formatCurrency = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  const amount = parseInt(numbers) / 100;
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const formatCpfCnpj = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return numbers
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return numbers
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

export const formatCep = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  return numbers.replace(/(\d{5})(\d)/, "$1-$2");
};

export const formatCardNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  return numbers.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};
