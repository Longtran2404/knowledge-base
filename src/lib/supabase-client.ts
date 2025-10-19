/**
 * Temporary workaround for webpack cache issue
 * Re-exports from supabase-config to resolve phantom import
 */
export * from './supabase-config';
export { supabase } from './supabase-config';
