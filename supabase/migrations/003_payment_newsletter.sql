-- ============================================
-- Migration 003: Payment tracking + Newsletter
-- ============================================

-- Add Revolut payment tracking to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS revolut_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_revolut ON orders(revolut_order_id);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  status        TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed'))
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public subscribe newsletter"
  ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admin read newsletter"
  ON newsletter_subscribers FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Admin manage newsletter"
  ON newsletter_subscribers FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );
