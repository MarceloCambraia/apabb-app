import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type BoletoStatus = "idle" | "loading" | "ready" | "error";

export interface BoletoData {
  nossoNumero: string;
  linhaDigitavel: string | null;
  codigoBarras: string | null;
  pdfUrl: string | null;
  dueDate: string;
  amount: number;
}

export interface BoletoPagador {
  nome: string;
  cpf: string;
  endereco: {
    cep: string;
    address: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export function useBoletoPayment() {
  const [status, setStatus] = useState<BoletoStatus>("idle");
  const [boleto, setBoleto] = useState<BoletoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateBoleto = useCallback(
    async (params: { valor: number; pagador: BoletoPagador }) => {
      setStatus("loading");
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("gerar-boleto-bb", {
          body: { valor: params.valor, pagador: params.pagador },
        });

        if (fnError) throw fnError;
        if (!data?.success) throw new Error(data?.error || "Erro ao gerar boleto");

        setBoleto({
          nossoNumero: data.nossoNumero,
          linhaDigitavel: data.linhaDigitavel,
          codigoBarras: data.codigoBarras,
          pdfUrl: data.pdfUrl,
          dueDate: data.dueDate,
          amount: data.amount,
        });
        setStatus("ready");
      } catch (err: any) {
        console.error("Boleto generation error:", err);
        const msg = err.message || "Erro ao gerar boleto";
        setError(msg);
        setStatus("error");
        toast({ title: "Erro ao gerar boleto", description: msg, variant: "destructive" });
      }
    },
    [toast]
  );

  const copyLinhaDigitavel = useCallback(async () => {
    if (!boleto?.linhaDigitavel) return;
    await navigator.clipboard.writeText(boleto.linhaDigitavel);
    setCopied(true);
    toast({ title: "Linha digitável copiada!" });
    setTimeout(() => setCopied(false), 3000);
  }, [boleto, toast]);

  const reset = useCallback(() => {
    setStatus("idle");
    setBoleto(null);
    setError(null);
    setCopied(false);
  }, []);

  return {
    status,
    boleto,
    error,
    copied,
    generateBoleto,
    copyLinhaDigitavel,
    reset,
  };
}
