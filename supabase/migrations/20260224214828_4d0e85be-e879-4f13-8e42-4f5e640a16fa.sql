-- Add transaction_id column to donations for Mercado Pago webhook matching
ALTER TABLE public.donations ADD COLUMN transaction_id TEXT UNIQUE;

-- Create index for fast webhook lookups
CREATE INDEX idx_donations_transaction_id ON public.donations(transaction_id);

-- Enable Realtime for donations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;