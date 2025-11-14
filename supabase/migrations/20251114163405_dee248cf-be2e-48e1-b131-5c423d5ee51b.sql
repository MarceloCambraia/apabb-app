-- Add UPDATE policy for donations so users can manage their recurring donations
CREATE POLICY "Users can update their own donations" 
ON public.donations 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);