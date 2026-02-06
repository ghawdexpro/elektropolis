-- ============================================
-- ElektroPolis Database Schema
-- ============================================

-- BRANDS
CREATE TABLE brands (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  logo_url    TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- COLLECTIONS
CREATE TABLE collections (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title           TEXT NOT NULL,
  handle          TEXT NOT NULL UNIQUE,
  description     TEXT,
  image_url       TEXT,
  seo_title       TEXT,
  seo_description TEXT,
  sort_order      INT DEFAULT 0,
  is_visible      BOOLEAN DEFAULT TRUE,
  shopify_id      BIGINT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title             TEXT NOT NULL,
  handle            TEXT NOT NULL UNIQUE,
  body_html         TEXT,
  vendor            TEXT,
  brand_id          UUID REFERENCES brands(id),
  product_type      TEXT,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  tags              TEXT[] DEFAULT '{}',
  price             DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price  DECIMAL(10,2),
  cost_price        DECIMAL(10,2),
  currency          TEXT DEFAULT 'EUR',
  sku               TEXT,
  barcode           TEXT,
  track_inventory   BOOLEAN DEFAULT TRUE,
  inventory_count   INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  weight_grams      INT DEFAULT 0,
  requires_shipping BOOLEAN DEFAULT TRUE,
  seo_title         TEXT,
  seo_description   TEXT,
  shopify_id        BIGINT,
  shopify_variant_id BIGINT,
  search_vector     TSVECTOR,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_handle ON products(handle);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- PRODUCT IMAGES
CREATE TABLE product_images (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  width       INT,
  height      INT,
  position    INT DEFAULT 0,
  is_primary  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- PRODUCT VARIANTS
CREATE TABLE product_variants (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  sku               TEXT,
  price             DECIMAL(10,2) NOT NULL,
  compare_at_price  DECIMAL(10,2),
  inventory_count   INT DEFAULT 0,
  option1_name      TEXT,
  option1_value     TEXT,
  option2_name      TEXT,
  option2_value     TEXT,
  option3_name      TEXT,
  option3_value     TEXT,
  weight_grams      INT DEFAULT 0,
  image_url         TEXT,
  position          INT DEFAULT 0,
  shopify_id        BIGINT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);

-- PRODUCT-COLLECTION JUNCTION
CREATE TABLE product_collections (
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  position      INT DEFAULT 0,
  PRIMARY KEY (product_id, collection_id)
);

-- PROFILES (extends Supabase auth.users)
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  phone         TEXT,
  role          TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  address_line1 TEXT,
  address_line2 TEXT,
  city          TEXT,
  state         TEXT,
  postal_code   TEXT,
  country       TEXT DEFAULT 'MT',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number      SERIAL,
  user_id           UUID REFERENCES auth.users(id),
  email             TEXT NOT NULL,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status    TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'partially_refunded')),
  fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled')),
  subtotal          DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost     DECIMAL(10,2) DEFAULT 0,
  tax_amount        DECIMAL(10,2) DEFAULT 0,
  discount_amount   DECIMAL(10,2) DEFAULT 0,
  total             DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency          TEXT DEFAULT 'EUR',
  shipping_name     TEXT,
  shipping_line1    TEXT,
  shipping_line2    TEXT,
  shipping_city     TEXT,
  shipping_state    TEXT,
  shipping_postal   TEXT,
  shipping_country  TEXT DEFAULT 'MT',
  shipping_phone    TEXT,
  billing_name      TEXT,
  billing_line1     TEXT,
  billing_line2     TEXT,
  billing_city      TEXT,
  billing_state     TEXT,
  billing_postal    TEXT,
  billing_country   TEXT DEFAULT 'MT',
  revolut_payment_id TEXT,
  customer_notes    TEXT,
  internal_notes    TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ORDER LINE ITEMS
CREATE TABLE order_items (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id),
  variant_id    UUID REFERENCES product_variants(id),
  title         TEXT NOT NULL,
  sku           TEXT,
  price         DECIMAL(10,2) NOT NULL,
  quantity      INT NOT NULL DEFAULT 1,
  total         DECIMAL(10,2) NOT NULL,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- STATIC PAGES
CREATE TABLE pages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title           TEXT NOT NULL,
  handle          TEXT NOT NULL UNIQUE,
  body_html       TEXT,
  seo_title       TEXT,
  seo_description TEXT,
  is_visible      BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- FAQS
CREATE TABLE faqs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category    TEXT NOT NULL,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  position    INT DEFAULT 0,
  is_visible  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- STORE SETTINGS
CREATE TABLE store_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Full-text search on products
CREATE OR REPLACE FUNCTION products_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.vendor, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.product_type, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.body_html, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION products_search_update();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Products: public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Admin manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Collections: public read, admin write
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible collections" ON collections FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "Admin manage collections" ON collections FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Brands: public read
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage brands" ON brands FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Product images: public read
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read images" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage images" ON product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Product variants: public read
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read variants" ON product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage variants" ON product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Product collections: public read
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product_collections" ON product_collections FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage product_collections" ON product_collections FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Profiles: users see own, admins see all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders: users see own, admins see all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin manage orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Order items: users see own order items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admin manage order items" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Pages: public read
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible pages" ON pages FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "Admin manage pages" ON pages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- FAQs: public read
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible faqs" ON faqs FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "Admin manage faqs" ON faqs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Store settings: public read, admin write
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON store_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage settings" ON store_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- SEED STORE SETTINGS
-- ============================================

INSERT INTO store_settings (key, value) VALUES
  ('store_name', '"ElektroPolis Malta"'),
  ('store_email', '"info@elektropolis.mt"'),
  ('store_phone', '"(+356) 9921 3791"'),
  ('store_currency', '"EUR"'),
  ('store_country', '"MT"');
