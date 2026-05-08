-- Helper: is_volunteer_coordinator
CREATE OR REPLACE FUNCTION public.is_volunteer_coordinator(_user_id uuid, _nucleus text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'coordenador_voluntarios'
      AND nucleus = _nucleus
  )
$$;

-- Helper: can_manage_volunteers (admin OR coordinator of nucleus)
CREATE OR REPLACE FUNCTION public.can_manage_volunteers(_user_id uuid, _nucleus text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role = 'admin'
        OR (role = 'coordenador_voluntarios' AND nucleus = _nucleus)
      )
  )
$$;

-- volunteers: coordinators can SELECT
CREATE POLICY "Coordinators can view volunteers from their nucleus"
ON public.volunteers FOR SELECT
USING (public.is_volunteer_coordinator(auth.uid(), nucleus));

-- volunteers: admin or coordinator can UPDATE (review)
CREATE POLICY "Managers can update volunteers"
ON public.volunteers FOR UPDATE
USING (public.can_manage_volunteers(auth.uid(), nucleus))
WITH CHECK (public.can_manage_volunteers(auth.uid(), nucleus));

-- volunteer_opportunities: coordinators full CRUD in their nucleus
CREATE POLICY "Coordinators can view opportunities in their nucleus"
ON public.volunteer_opportunities FOR SELECT
USING (public.is_volunteer_coordinator(auth.uid(), nucleus));

CREATE POLICY "Coordinators can insert opportunities in their nucleus"
ON public.volunteer_opportunities FOR INSERT
WITH CHECK (public.is_volunteer_coordinator(auth.uid(), nucleus));

CREATE POLICY "Coordinators can update opportunities in their nucleus"
ON public.volunteer_opportunities FOR UPDATE
USING (public.is_volunteer_coordinator(auth.uid(), nucleus));

CREATE POLICY "Coordinators can delete opportunities in their nucleus"
ON public.volunteer_opportunities FOR DELETE
USING (public.is_volunteer_coordinator(auth.uid(), nucleus));

-- project_registrations: coordinators view & update for projects in their nucleus
CREATE POLICY "Coordinators can view registrations for their nucleus projects"
ON public.project_registrations FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = project_registrations.project_id
    AND public.is_volunteer_coordinator(auth.uid(), p.nucleus)
));

CREATE POLICY "Coordinators can update registrations for their nucleus projects"
ON public.project_registrations FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = project_registrations.project_id
    AND public.is_volunteer_coordinator(auth.uid(), p.nucleus)
));

-- nucleus_coordinators: already viewable by any authenticated user (existing policy covers it)