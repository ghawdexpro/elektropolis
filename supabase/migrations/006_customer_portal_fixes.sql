-- ============================================
-- Customer Portal Fixes
-- ============================================

-- Fix 1: handle_new_user() trigger — use ON CONFLICT to prevent
-- "Database error saving new user" when a profiles row already exists.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 2: order_items RLS — also check customer_id (checkout sets customer_id, not user_id)
DROP POLICY IF EXISTS "Users read own order items" ON order_items;
CREATE POLICY "Users read own order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.customer_id = auth.uid())
  )
);

-- Fix 3: Profile sync trigger — keep profiles table in sync when
-- user updates their metadata via supabase.auth.updateUser()
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', profiles.phone),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_update();
