CREATE TABLE public.card_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  authorization_code TEXT,
  card_last_four TEXT NOT NULL,
  card_brand TEXT,
  pagador_nome TEXT NOT NULL,
  pagador_cpf TEXT NOT NULL,
  pagador_email TEXT,
  bb_response JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.card_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own card payments"
ON public.card_payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own card payments"
ON public.card_payments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all card payments"
ON public.card_payments
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE TRIGGER update_card_payments_updated_at
BEFORE UPDATE ON public.card_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();