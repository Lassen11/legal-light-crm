-- Update RLS policy for clients table to allow only admins to delete
DROP POLICY IF EXISTS "Allow all operations on clients" ON public.clients;

-- Allow everyone to read
CREATE POLICY "Anyone can view clients"
ON public.clients
FOR SELECT
USING (true);

-- Allow everyone to insert
CREATE POLICY "Anyone can insert clients"
ON public.clients
FOR INSERT
WITH CHECK (true);

-- Allow everyone to update
CREATE POLICY "Anyone can update clients"
ON public.clients
FOR UPDATE
USING (true);

-- Only admins can delete
CREATE POLICY "Only admins can delete clients"
ON public.clients
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));