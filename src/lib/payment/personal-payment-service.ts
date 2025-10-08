/**
 * Personal Payment Service
 * Handles personal bank transfer payments with manual admin confirmation
 */

import { supabase } from '../supabase';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  product_type: 'course' | 'product' | 'membership';
  product_id: string;
  product_name: string;
  payment_method: 'bank_transfer';
  qr_code_data: string;
  payment_screenshot_url?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  admin_notes?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
  // User info (joined from nlc_accounts)
  user_email?: string;
  user_full_name?: string;
}

export interface CreateTransactionInput {
  user_id: string;
  amount: number;
  product_type: 'course' | 'product' | 'membership';
  product_id: string;
  product_name: string;
  qr_code_data: string;
}

export interface UpdateTransactionInput {
  transaction_id: string;
  payment_screenshot_url?: string;
  status?: 'pending' | 'confirmed' | 'rejected';
  admin_notes?: string;
  confirmed_by?: string;
}

/**
 * Create a new transaction
 */
export async function createTransaction(input: CreateTransactionInput): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from('nlc_transactions')
      .insert({
        user_id: input.user_id,
        amount: input.amount,
        product_type: input.product_type,
        product_id: input.product_id,
        product_name: input.product_name,
        payment_method: 'bank_transfer',
        qr_code_data: input.qr_code_data,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Create transaction error:', error);
      return null;
    }

    return data as Transaction;
  } catch (error) {
    console.error('Create transaction exception:', error);
    return null;
  }
}

/**
 * Upload payment screenshot to Supabase Storage
 */
export async function uploadPaymentScreenshot(
  transactionId: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${transactionId}-${Date.now()}.${fileExt}`;
    const filePath = `payment-screenshots/${fileName}`;

    const { data, error } = await supabase.storage
      .from('user-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload screenshot error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('user-files')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload screenshot exception:', error);
    return null;
  }
}

/**
 * Update transaction with payment screenshot
 */
export async function updateTransactionScreenshot(
  transactionId: string,
  screenshotUrl: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('nlc_transactions')
      .update({
        payment_screenshot_url: screenshotUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    if (error) {
      console.error('Update transaction screenshot error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Update transaction screenshot exception:', error);
    return false;
  }
}

/**
 * Get transaction by ID
 */
export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from('nlc_transactions')
      .select(`
        *,
        user:nlc_accounts!user_id(email, full_name)
      `)
      .eq('id', transactionId)
      .single();

    if (error) {
      console.error('Get transaction error:', error);
      return null;
    }

    // Flatten user data
    const transaction = {
      ...data,
      user_email: data.user?.email,
      user_full_name: data.user?.full_name,
    };

    delete transaction.user;

    return transaction as Transaction;
  } catch (error) {
    console.error('Get transaction exception:', error);
    return null;
  }
}

/**
 * Get user transactions
 */
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('nlc_transactions')
      .select(`
        *,
        user:nlc_accounts!user_id(email, full_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user transactions error:', error);
      return [];
    }

    // Flatten user data
    const transactions = data.map(t => ({
      ...t,
      user_email: t.user?.email,
      user_full_name: t.user?.full_name,
    }));

    transactions.forEach(t => delete t.user);

    return transactions as Transaction[];
  } catch (error) {
    console.error('Get user transactions exception:', error);
    return [];
  }
}

/**
 * Get all pending transactions (for admin)
 */
export async function getPendingTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('nlc_transactions')
      .select(`
        *,
        user:nlc_accounts!user_id(email, full_name)
      `)
      .eq('status', 'pending')
      .not('payment_screenshot_url', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get pending transactions error:', error);
      return [];
    }

    // Flatten user data
    const transactions = data.map(t => ({
      ...t,
      user_email: t.user?.email,
      user_full_name: t.user?.full_name,
    }));

    transactions.forEach(t => delete t.user);

    return transactions as Transaction[];
  } catch (error) {
    console.error('Get pending transactions exception:', error);
    return [];
  }
}

/**
 * Get all transactions with filters (for admin)
 */
export async function getAllTransactions(
  status?: 'pending' | 'confirmed' | 'rejected',
  limit: number = 50
): Promise<Transaction[]> {
  try {
    let query = supabase
      .from('nlc_transactions')
      .select(`
        *,
        user:nlc_accounts!user_id(email, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get all transactions error:', error);
      return [];
    }

    // Flatten user data
    const transactions = data.map(t => ({
      ...t,
      user_email: t.user?.email,
      user_full_name: t.user?.full_name,
    }));

    transactions.forEach(t => delete t.user);

    return transactions as Transaction[];
  } catch (error) {
    console.error('Get all transactions exception:', error);
    return [];
  }
}

/**
 * Admin: Confirm transaction
 */
export async function confirmTransaction(
  transactionId: string,
  adminId: string,
  adminNotes?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('nlc_transactions')
      .update({
        status: 'confirmed',
        confirmed_by: adminId,
        confirmed_at: new Date().toISOString(),
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    if (error) {
      console.error('Confirm transaction error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Confirm transaction exception:', error);
    return false;
  }
}

/**
 * Admin: Reject transaction
 */
export async function rejectTransaction(
  transactionId: string,
  adminId: string,
  adminNotes: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('nlc_transactions')
      .update({
        status: 'rejected',
        confirmed_by: adminId,
        confirmed_at: new Date().toISOString(),
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    if (error) {
      console.error('Reject transaction error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Reject transaction exception:', error);
    return false;
  }
}

/**
 * Get transaction statistics (for admin dashboard)
 */
export async function getTransactionStats(): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
  totalAmount: number;
  confirmedAmount: number;
} | null> {
  try {
    const { data, error } = await supabase
      .from('nlc_transactions')
      .select('status, amount');

    if (error) {
      console.error('Get transaction stats error:', error);
      return null;
    }

    const stats = {
      total: data.length,
      pending: data.filter(t => t.status === 'pending').length,
      confirmed: data.filter(t => t.status === 'confirmed').length,
      rejected: data.filter(t => t.status === 'rejected').length,
      totalAmount: data.reduce((sum, t) => sum + t.amount, 0),
      confirmedAmount: data
        .filter(t => t.status === 'confirmed')
        .reduce((sum, t) => sum + t.amount, 0),
    };

    return stats;
  } catch (error) {
    console.error('Get transaction stats exception:', error);
    return null;
  }
}
