-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  nucleus TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role, nucleus)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check admin role for specific nucleus
CREATE OR REPLACE FUNCTION public.is_nucleus_admin(_user_id UUID, _nucleus TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
      AND nucleus = _nucleus
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Add nucleus column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nucleus TEXT;

-- Update donations table policies to allow admins to view donations from their nucleus
CREATE POLICY "Admins can view donations from their nucleus"
ON public.donations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND nucleus = donations.nucleus
  )
);

-- Update associates table policies to allow admins to view associates from their nucleus
CREATE POLICY "Admins can view associates from their nucleus"
ON public.associates
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND nucleus = associates.nucleus
  )
);

-- Update volunteers table policies to allow admins to view volunteers from their nucleus
CREATE POLICY "Admins can view volunteers from their nucleus"
ON public.volunteers
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND nucleus = volunteers.nucleus
  )
);