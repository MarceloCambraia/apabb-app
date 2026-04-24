import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type CardStatus = "idle" | "loading" | "approved" | "declined" | "error";

export interface CardData {
  numero: string;
  validade: string; // MM/YY or MM/YYYY
  cvv: string;
  nome: string;
}

export interface CardPagador {
  nome: string;
  cpf: string;
  email?: string;
}

export interface CardResult {
  status: "approved" | "declined";
  authorizationCode: string | null;
  message: string;
  cardLastFour: string;
  cardBrand: string;
  amount: number;
}

export function useCardPayment() {
  const [status, setStatus] = useState<CardStatus>("idle");
  const [result, setResult] = useState<CardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const processPayment = useCallback(
    async (params: { valor: number; cartao: CardData; pagador: CardPagador }) => {
      setStatus("loading");
      setError(null);
      setResult(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("processar-cartao-bb", {
          body: {
            valor: params.valor,
            cartao: params.cartao,
            pagador: params.pagador,
          },
        });

        if (fnError) throw fnError;

        if (data?.success && data?.status === "approved") {
          setResult({
            status: "approved",
            authorizationCode: data.authorizationCode || null,
            message: data.message || "Pagamento aprovado",
            cardLastFour: data.cardLastFour,
            cardBrand: data.cardBrand,
            amount: data.amount,
          });
          setStatus("approved");
        } else {
          const msg = data?.message || data?.error || "Pagamento não aprovado";
          setResult({
            status: "declined",
            authorizationCode: null,
            message: msg,
            cardLastFour: data?.cardLastFour || "",
            cardBrand: data?.cardBrand || "",
            amount: data?.amount || params.valor,
          });
          setError(msg);
          setStatus("declined");
        }
      } catch (err: any) {
        console.error("Card payment error:", err);
        const msg = err.message || "Erro ao processar pagamento";
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
