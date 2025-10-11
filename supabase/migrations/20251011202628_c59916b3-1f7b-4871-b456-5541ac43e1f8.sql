-- Fix 1: Add user_id to employees table to link to authenticated users
ALTER TABLE employees 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX idx_employees_user_id ON employees(user_id);

-- Populate existing employee records by matching emails
UPDATE employees e
SET user_id = p.id
FROM profiles p
WHERE e.email = p.email;

-- Fix 2: Drop overly permissive RLS policies on clients table
DROP POLICY IF EXISTS "Anyone can view clients" ON clients;
DROP POLICY IF EXISTS "Anyone can insert clients" ON clients;
DROP POLICY IF EXISTS "Anyone can update clients" ON clients;

-- Fix 3: Implement proper role-based access control for clients
-- Admins can manage all clients
CREATE POLICY "Admins can manage all clients"
ON clients FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can view clients assigned to them via tasks
CREATE POLICY "Users can view assigned clients"
ON clients FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN employees e ON t.employee_id = e.id
    WHERE t.client_id = clients.id AND e.user_id = auth.uid()
  )
);

-- Sales and care managers can create clients
CREATE POLICY "Sales and care managers can create clients"
ON clients FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'sales_manager') OR
  public.has_role(auth.uid(), 'care_manager')
);

-- Users can update clients they're assigned to
CREATE POLICY "Users can update assigned clients"
ON clients FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN employees e ON t.employee_id = e.id
    WHERE t.client_id = clients.id AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN employees e ON t.employee_id = e.id
    WHERE t.client_id = clients.id AND e.user_id = auth.uid()
  )
);

-- Fix 4: Update RLS policies on employees table
DROP POLICY IF EXISTS "Authenticated users can view employees" ON employees;
DROP POLICY IF EXISTS "Only admins can manage employees" ON employees;

CREATE POLICY "Users can view all employees"
ON employees FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own employee record"
ON employees FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all employees"
ON employees FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix 5: Fix overly permissive tasks RLS policies
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;

CREATE POLICY "Admins can manage all tasks"
ON tasks FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view tasks assigned to them"
ON tasks FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = tasks.employee_id AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'sales_manager') OR
  public.has_role(auth.uid(), 'care_manager') OR
  public.has_role(auth.uid(), 'lawyer') OR
  public.has_role(auth.uid(), 'arbitration_manager')
);

CREATE POLICY "Users can update tasks assigned to them"
ON tasks FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = tasks.employee_id AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = tasks.employee_id AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete tasks assigned to them"
ON tasks FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = tasks.employee_id AND e.user_id = auth.uid()
  )
);