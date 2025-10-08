-- Create nlc_transactions table for personal payment system
-- This table stores bank transfer transactions with manual admin verification

CREATE TABLE IF NOT EXISTS nlc_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES nlc_accounts(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('course', 'product', 'membership')),
  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
  qr_code_data TEXT,
  payment_screenshot_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  admin_notes TEXT,
  confirmed_by UUID REFERENCES nlc_accounts(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON nlc_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON nlc_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON nlc_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_product_type ON nlc_transactions(product_type);
CREATE INDEX IF NOT EXISTS idx_transactions_confirmed_by ON nlc_transactions(confirmed_by);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nlc_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_nlc_transactions_updated_at
  BEFORE UPDATE ON nlc_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_nlc_transactions_updated_at();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE nlc_transactions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON nlc_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can create their own transactions
CREATE POLICY "Users can create their own transactions"
  ON nlc_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own pending transactions (to add screenshot)
CREATE POLICY "Users can update their own pending transactions"
  ON nlc_transactions
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Policy 4: Admins can view all transactions
-- Note: You need to have an is_admin field in nlc_accounts or create a separate admins table
-- For now, we'll create a simple check based on specific user IDs or email domains
CREATE POLICY "Admins can view all transactions"
  ON nlc_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nlc_accounts
      WHERE id = auth.uid()
      AND (email LIKE '%@admin.namlongcenter.com' OR role = 'admin')
    )
  );

-- Policy 5: Admins can update any transaction (for confirmation/rejection)
CREATE POLICY "Admins can update any transaction"
  ON nlc_transactions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM nlc_accounts
      WHERE id = auth.uid()
      AND (email LIKE '%@admin.namlongcenter.com' OR role = 'admin')
    )
  );

-- Add role column to nlc_accounts if it doesn't exist
-- This allows for better admin role management
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'nlc_accounts'
    AND column_name = 'role'
  ) THEN
    ALTER TABLE nlc_accounts ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
  END IF;
END $$;

-- Create index on role for admin queries
CREATE INDEX IF NOT EXISTS idx_accounts_role ON nlc_accounts(role);

-- Create a view for transaction statistics
CREATE OR REPLACE VIEW nlc_transaction_stats AS
SELECT
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COALESCE(SUM(amount), 0) as total_amount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'confirmed'), 0) as confirmed_amount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as pending_amount,
  COALESCE(AVG(amount), 0) as avg_transaction_amount,
  COALESCE(AVG(amount) FILTER (WHERE status = 'confirmed'), 0) as avg_confirmed_amount
FROM nlc_transactions;

-- Grant access to the view for admins
GRANT SELECT ON nlc_transaction_stats TO authenticated;

-- Comments for documentation
COMMENT ON TABLE nlc_transactions IS 'Stores personal bank transfer payment transactions with manual admin verification';
COMMENT ON COLUMN nlc_transactions.user_id IS 'References the user who made the payment';
COMMENT ON COLUMN nlc_transactions.amount IS 'Payment amount in VND';
COMMENT ON COLUMN nlc_transactions.product_type IS 'Type of product: course, product, or membership';
COMMENT ON COLUMN nlc_transactions.product_id IS 'ID of the purchased product/course/membership';
COMMENT ON COLUMN nlc_transactions.product_name IS 'Name of the purchased item for easy reference';
COMMENT ON COLUMN nlc_transactions.payment_method IS 'Payment method used (currently only bank_transfer)';
COMMENT ON COLUMN nlc_transactions.qr_code_data IS 'QR code content for bank transfer';
COMMENT ON COLUMN nlc_transactions.payment_screenshot_url IS 'URL to the uploaded payment screenshot from Supabase Storage';
COMMENT ON COLUMN nlc_transactions.status IS 'Transaction status: pending, confirmed, or rejected';
COMMENT ON COLUMN nlc_transactions.admin_notes IS 'Admin notes for confirmation or rejection reason';
COMMENT ON COLUMN nlc_transactions.confirmed_by IS 'Admin user ID who confirmed/rejected the transaction';
COMMENT ON COLUMN nlc_transactions.confirmed_at IS 'Timestamp when the transaction was confirmed/rejected';
