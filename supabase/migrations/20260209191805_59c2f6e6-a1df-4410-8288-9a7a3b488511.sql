
-- Create project status enum
CREATE TYPE public.project_status AS ENUM ('ativo', 'encerrado');

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  nucleus TEXT NOT NULL,
  image_url TEXT,
  status project_status NOT NULL DEFAULT 'ativo',
  max_slots INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view active projects
CREATE POLICY "Anyone can view active projects"
  ON public.projects FOR SELECT
  USING (status = 'ativo');

-- Admins can manage projects from their nucleus
CREATE POLICY "Admins can insert projects in their nucleus"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_nucleus_admin(auth.uid(), nucleus));

CREATE POLICY "Admins can update projects in their nucleus"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.is_nucleus_admin(auth.uid(), nucleus));

CREATE POLICY "Admins can delete projects in their nucleus"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.is_nucleus_admin(auth.uid(), nucleus));

-- Admins can also view all projects from their nucleus (including encerrado)
CREATE POLICY "Admins can view all projects from their nucleus"
  ON public.projects FOR SELECT
  TO authenticated
  USING (public.is_nucleus_admin(auth.uid(), nucleus));

-- Create project_registrations table
CREATE TABLE public.project_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_registrations ENABLE ROW LEVEL SECURITY;

-- Users can register themselves
CREATE POLICY "Users can register for projects"
  ON public.project_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations"
  ON public.project_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view registrations for projects in their nucleus
CREATE POLICY "Admins can view registrations for their nucleus projects"
  ON public.project_registrations FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.user_roles ur ON ur.user_id = auth.uid()
    WHERE p.id = project_registrations.project_id
      AND ur.role = 'admin'
      AND ur.nucleus = p.nucleus
  ));

-- Admins can update registration status
CREATE POLICY "Admins can update registrations for their nucleus projects"
  ON public.project_registrations FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.user_roles ur ON ur.user_id = auth.uid()
    WHERE p.id = project_registrations.project_id
      AND ur.role = 'admin'
      AND ur.nucleus = p.nucleus
  ));

-- Trigger for updated_at on projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
