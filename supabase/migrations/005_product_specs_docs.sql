-- Add specifications JSONB column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]'::jsonb;

-- Product documents table (PDFs, manuals, spec sheets)
CREATE TABLE IF NOT EXISTS product_documents (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  title       TEXT NOT NULL,
  type        TEXT DEFAULT 'pdf' CHECK (type IN ('pdf', 'manual', 'spec', 'other')),
  position    INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_documents_product ON product_documents(product_id);

-- RLS for product_documents: public read, admin write
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read documents" ON product_documents FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage documents" ON product_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
