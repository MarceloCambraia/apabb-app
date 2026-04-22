-- Tabela para armazenar cobranças de boleto geradas via API do Banco do Brasil
CREATE TABLE public.boleto_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  numero_convenio TEXT,
  nosso_numero TEXT,
  linha_digitavel TEXT,
  codigo_barras TEXT,
  pdf_url TEXT,
  pagador_nome TEXT NOT NULL,
  pagador_cpf TEXT NOT NULL,
  pagador_endereco JSONB,
  due_date DATE NOT NULL,
  bb_response JSONB,
  webhook_received_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilita RLS
ALTER TABLE public.boleto_charges ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seus próprios boletos
CREATE POLICY "Users can view own boletos"
  ON public.boleto_charges
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuário pode criar seus próprios boletos
CREATE POLICY "Users can insert own boletos"
  ON public.boleto_charges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins veem todos os boletos
CREATE POLICY "Admins can view all boletos"
  ON public.boleto_charges
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
  ));

-- Trigger para updated_at
CREATE TRIGGER update_boleto_charges_updated_at
  BEFORE UPDATE ON public.boleto_charges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX idx_boleto_charges_user_id ON public.boleto_charges(user_id);
CREATE INDEX idx_boleto_charges_status ON public.boleto_charges(status);
CREATE INDEX idx_boleto_charges_nosso_numero ON public.boleto_charges(nosso_numero);