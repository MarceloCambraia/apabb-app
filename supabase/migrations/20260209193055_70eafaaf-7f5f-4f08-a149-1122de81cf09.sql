
-- Create volunteer_opportunities table
CREATE TABLE public.volunteer_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  nucleus TEXT NOT NULL,
  image_url TEXT,
  time_commitment TEXT,
  status project_status NOT NULL DEFAULT 'ativo',
  max_slots INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;

-- Anyone can view active opportunities
CREATE POLICY "Anyone can view active volunteer opportunities"
  ON public.volunteer_opportunities FOR SELECT
  USING (status = 'ativo');

-- Admins can view all from their nucleus
CREATE POLICY "Admins can view all volunteer opportunities from their nucleus"
  ON public.volunteer_opportunities FOR SELECT
  TO authenticated
  USING (public.is_nucleus_admin(auth.uid(), nucleus));

CREATE POLICY "Admins can insert volunteer opportunities"
  ON public.volunteer_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (public.is_nucleus_admin(auth.uid(), nucleus));

CREATE POLICY "Admins can update volunteer opportunities"
  ON public.volunteer_opportunities FOR UPDATE
  TO authenticated
  USING (public.is_nucleus_admin(auth.uid(), nucleus));

CREATE POLICY "Admins can delete volunteer opportunities"
  ON public.volunteer_opportunities FOR DELETE
  TO authenticated
  USING (public.is_nucleus_admin(auth.uid(), nucleus));

-- Create volunteer_opportunity_registrations table
CREATE TABLE public.volunteer_opportunity_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, user_id)
);

ALTER TABLE public.volunteer_opportunity_registrations ENABLE ROW LEVEL SECURITY;

-- Users can register
CREATE POLICY "Users can register for volunteer opportunities"
  ON public.volunteer_opportunity_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view own registrations
CREATE POLICY "Users can view own volunteer registrations"
  ON public.volunteer_opportunity_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view registrations for their nucleus
CREATE POLICY "Admins can view volunteer registrations for their nucleus"
  ON public.volunteer_opportunity_registrations FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.volunteer_opportunities vo
    JOIN public.user_roles ur ON ur.user_id = auth.uid()
    WHERE vo.id = volunteer_opportunity_registrations.opportunity_id
      AND ur.role = 'admin'
      AND ur.nucleus = vo.nucleus
  ));

-- Admins can update registrations
CREATE POLICY "Admins can update volunteer registrations for their nucleus"
  ON public.volunteer_opportunity_registrations FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.volunteer_opportunities vo
    JOIN public.user_roles ur ON ur.user_id = auth.uid()
    WHERE vo.id = volunteer_opportunity_registrations.opportunity_id
      AND ur.role = 'admin'
      AND ur.nucleus = vo.nucleus
  ));

-- Trigger for updated_at
CREATE TRIGGER update_volunteer_opportunities_updated_at
  BEFORE UPDATE ON public.volunteer_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
