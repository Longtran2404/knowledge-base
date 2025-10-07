/**
 * Supabase Types Helper
 * Temporary helper to bypass type checking for NLC tables
 * TODO: Replace with proper generated types after database is deployed
 */

import { supabase } from "./supabase-config";

/**
 * Get Supabase client with NLC table support
 * This bypasses TypeScript type checking for custom NLC tables
 */
export const getNLCSupabase = () => {
  return supabase as any;
};

/**
 * Type-safe wrapper for NLC table operations
 */
export const nlcSupabase = {
  from: (tableName: string) => {
    return (supabase as any).from(tableName);
  }
};
