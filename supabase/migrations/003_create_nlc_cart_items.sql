-- =============================================
-- Migration: Create nlc_cart_items table
-- Description: Cart table for NLC; syncs with CartContext
-- =============================================

CREATE TABLE IF NOT EXISTS nlc_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'course',
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  product_image TEXT,
  product_metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nlc_cart_user ON nlc_cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_nlc_cart_product ON nlc_cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_nlc_cart_type ON nlc_cart_items(product_type);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION nlc_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_nlc_cart_items_update ON nlc_cart_items;
CREATE TRIGGER tr_nlc_cart_items_update
  BEFORE UPDATE ON nlc_cart_items
  FOR EACH ROW EXECUTE FUNCTION nlc_cart_updated_at();

ALTER TABLE nlc_cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cart"
  ON nlc_cart_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their cart"
  ON nlc_cart_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their cart"
  ON nlc_cart_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their cart"
  ON nlc_cart_items FOR DELETE
  USING (user_id = auth.uid());
