-- Fix employees table RLS policies
-- Remove overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on employees" ON public.employees;

-- Allow authenticated users to view employees (needed for employee assignment dropdowns)
CREATE POLICY "Authenticated users can view employees"
ON public.employees
FOR SELECT
TO authenticated
USING (true);

-- Only admins can create, update, or delete employees
CREATE POLICY "Only admins can manage employees"
ON public.employees
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));