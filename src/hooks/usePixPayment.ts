import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type PixStatus = "idle" | "loading" | "awaiting_payment" | "paid" | "expired" | "error";

interface PixPaymentData {
  pixCopiaECola: string;
  txid: string;
}

const PIX_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
const POLLING_INTERVAL_MS = 5000; // 5 seconds

export function usePixPayment() {
  const [status, setStatus] = useState<PixStatus>("idle");
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const expiresAtRef = useRef<number>(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (status !== "awaiting_payment") return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAtRef.current - now) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        setStatus("expired");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // Polling fallback - checks payment status every 5 seconds
  useEffect(() => {
    if (status !== "awaiting_payment" || !pixData?.txid) return;

    const checkPaymentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("pix_charges")
          .select("status")
          .eq("txid", pixData.txid)
          .single();

        if (error) {
          console.warn("Polling error:", error);
          return;
        }

        if (data?.status === "paid") {
          console.log("Payment confirmed via polling!");
          setStatus("paid");
          toast({ title: "Pagamento confirmado! ✅", description: "Obrigado pela sua doação." });
        }
      } catch (err) {
        console.warn("Polling check failed:", err);
      }
    };

    // Start polling
    pollingRef.current = setInterval(checkPaymentStatus, POLLING_INTERVAL_MS);
    console.log("Polling started for txid:", pixData.txid);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        console.log("Polling stopped");
      }
    };
  }, [status, pixData?.txid, toast]);

  // Realtime subscription (keeping as backup, but polling is primary now)
  useEffect(() => {
    if (status !== "awaiting_payment" || !pixData?.txid) return;

    console.log("Setting up Realtime subscription for txid:", pixData.txid);

    const channel = supabase
      .channel(`pix-${pixData.txid}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pix_charges",
          filter: `txid=eq.${pixData.txid}`,
        },
        (payload) => {
          console.log("Realtime event received:", payload);
          const newStatus = (payload.new as any)?.status;
          if (newStatus === "paid") {
            setStatus("paid");
            toast({ title: "Pagamento confirmado! ✅", description: "Obrigado pela sua doação." });
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [status, pixData?.txid, toast]);

  const generatePix = useCallback(
    async (params: { valor: number; nucleus: string; donorName?: string; email?: string; cpf?: string }) => {
      setStatus("loading");
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("processar-dominio-bb", {
          body: { valor: params.valor, nucleus: params.nucleus, donorName: params.donorName, email: params.email, cpf: params.cpf },
        });

        if (fnError) throw fnError;
        if (!data?.success) throw new Error(data?.error || "Erro ao gerar PIX");

        const pixCopiaECola = data.pixCopiaECola;
        const txid = data.txid || data.loc?.id;

        if (!pixCopiaECola) throw new Error("pixCopiaECola não retornado");

        setPixData({ pixCopiaECola, txid });
        expiresAtRef.current = Date.now() + PIX_EXPIRATION_MS;
        setSecondsLeft(Math.floor(PIX_EXPIRATION_MS / 1000));
        setStatus("awaiting_payment");
      } catch (err: any) {
        console.error("PIX generation error:", err);
        setError(err.message || "Erro ao gerar PIX");
        setStatus("error");
        toast({ title: "Erro ao gerar PIX", description: err.message || "Tente novamente", variant: "destructive" });
      }
    },
    [toast]
  );

  const copyPixCode = useCallback(async () => {
    if (!pixData?.pixCopiaECola) return;
    await navigator.clipboard.writeText(pixData.pixCopiaECola);
    setCopied(true);
    toast({ title: "Código PIX copiado!" });
    setTimeout(() => setCopied(false), 3000);
  }, [pixData, toast]);

  const reset = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setStatus("idle");
    setPixData(null);
    setError(null);
    setSecondsLeft(0);
    setCopied(false);
  }, []);

  const formattedTime = `${Math.floor(secondsLeft / 60).toString().padStart(2, "0")}:${(secondsLeft % 60).toString().padStart(2, "0")}`;

  return {
    status,
    pixData,
    error,
    secondsLeft,
    formattedTime,
    copied,
    generatePix,
    copyPixCode,
    reset,
  };
}