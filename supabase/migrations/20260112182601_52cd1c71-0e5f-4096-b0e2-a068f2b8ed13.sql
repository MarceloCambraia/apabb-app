-- Drop the overly permissive SELECT policy that allows any authenticated user to see all records
DROP POLICY IF EXISTS "Authenticated users can view their own data" ON public.associates;

-- The existing "Admins can view associates from their nucleus" policy already provides
-- proper access control for administrators. No additional SELECT policy is needed
-- since associates table contains registration data without a user_id link.