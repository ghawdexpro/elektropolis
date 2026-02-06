-- ============================================
-- Fix orders table to match application code
-- ============================================

-- The application code uses different column names than the original schema.
-- This migration adds the columns that the code expects.

-- 1. Change order_number from SERIAL (integer) to TEXT
-- The checkout code generates string order numbers like "EP-20260206-1234"
ALTER TABLE orders ALTER COLUMN order_number DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN order_number TYPE TEXT USING order_number::TEXT;

-- 2. Add customer_id column (code uses this instead of user_id)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id);
-- Copy existing user_id data into customer_id
UPDATE orders SET customer_id = user_id WHERE customer_id IS NULL AND user_id IS NOT NULL;

-- 3. Add customer_email column (code uses this instead of email)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
-- Copy existing email data
UPDATE orders SET customer_email = email WHERE customer_email IS NULL AND email IS NOT NULL;

-- 4. Add customer_phone column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- 5. Add JSONB shipping_address and billing_address columns
-- Code stores address as JSON object instead of individual columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;

-- 6. Add notes column (code uses this instead of customer_notes)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
-- Copy existing customer_notes
UPDATE orders SET notes = customer_notes WHERE notes IS NULL AND customer_notes IS NOT NULL;

-- 7. Create index on customer_id
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- 8. Update RLS policies to include customer_id
DROP POLICY IF EXISTS "Users read own orders" ON orders;
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (
  user_id = auth.uid() OR customer_id = auth.uid()
);

-- 9. Allow anonymous inserts for guest checkout (using admin/service role)
-- The checkout API uses the admin client, so RLS is bypassed there.
-- But we need to allow order_items inserts as well.
DROP POLICY IF EXISTS "Public insert orders" ON orders;
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public insert order items" ON order_items;
CREATE POLICY "Public insert order items" ON order_items FOR INSERT WITH CHECK (TRUE);

-- 10. Drop the serial sequence that was created for order_number
-- (no longer needed since it's TEXT now)
DROP SEQUENCE IF EXISTS orders_order_number_seq CASCADE;
