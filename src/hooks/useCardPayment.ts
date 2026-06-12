import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type CardStatus = "idle" | "loading" | "pending_payment" | "error";

export interface CardPagador {
  nome: string;
  cpf: string;
  email?: string;
}

export interface CardResult {
  urlSolicitacao: string;
  numeroSolicitacao: number;
  qrCode?: string;
  amount: number;
}

export function useCardPayment() {
  const [status, setStatus] = useState<CardStatus>("idle");
  const [result, setResult] = useState<CardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const processPayment = useCallback(
    async (params: { valor: number; pagador: CardPagador }) => {
      setStatus("loading");
      setError(null);
      setResult(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("processar-cartao-bb", {
          body: {
            valor: params.valor,
            pagador: params.pagador,
          },
        });

        if (fnError) throw fnError;

        if (data?.success && data?.urlSolicitacao) {
          setResult({
            urlSolicitacao: data.urlSolicitacao,
            numeroSolicitacao: data.numeroSolicitacao,
            qrCode: data.qrCode,
            amount: params.valor,
          });
          setStatus("pending_payment");
        } else {
          const msg = data?.message || data?.error || "Erro ao gerar link de pagamento";
          setError(msg);
          setStatus("error");
          toast({ title: "Erro no pagamento", description: msg, variant: "destructive" });
        }
      } catch (err: any) {
        console.error("BBPay error:", err);
        const msg = err.message || "Erro ao criar solicitação de pagamento";
        setError(msg);
        setStatus("error");
        toast({ title: "Erro no pagamento", description: msg, variant: "destructive" });
      }
    },
    [toast]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, processPayment, reset };
}
