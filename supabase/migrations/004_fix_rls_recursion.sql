-- Fix infinite recursion in profiles RLS policy
-- The "Admin read all profiles" policy queries profiles from within profiles,
-- causing PostgreSQL error 42P17. This breaks ALL tables whose admin policies
-- reference profiles (products, collections, orders, etc.)

-- Step 1: Create a SECURITY DEFINER function that bypasses RLS when checking admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Step 2: Drop the recursive policy
DROP POLICY IF EXISTS "Admin read all profiles" ON profiles;

-- Step 3: Recreate using the SECURITY DEFINER function (no recursion)
CREATE POLICY "Admin read all profiles" ON profiles
  FOR SELECT USING (public.is_admin());
