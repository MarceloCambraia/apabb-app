-- Drop the overly permissive SELECT policy that allows any authenticated user to see all volunteer records
DROP POLICY IF EXISTS "Authenticated users can view volunteers" ON public.volunteers;

-- The existing "Admins can view volunteers from their nucleus" policy already provides
-- proper access control for administrators. No additional SELECT policy is needed.