/**
 * Clear Supabase Auth Storage
 * Run this in the browser console to clear expired auth tokens
 * 
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter
 */

(function clearSupabaseAuthStorage() {
  console.log('🧹 Clearing Supabase auth storage...');
  
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Find Supabase-related keys
    const supabaseKeys = keys.filter(key => 
      key.includes('supabase') || 
      key.includes('sb-') || 
      key.includes('auth-token')
    );
    
    if (supabaseKeys.length === 0) {
      console.log('✅ No Supabase auth tokens found');
      return;
    }
    
    console.log('📦 Found Supabase keys:', supabaseKeys);
    
    // Remove each key
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`❌ Removed: ${key}`);
    });
    
    console.log('✅ Successfully cleared Supabase auth storage!');
    console.log('🔄 Reload the page to start fresh');
    
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
  }
})();

// Optional: Auto-reload after 2 seconds
setTimeout(() => {
  console.log('🔄 Reloading page...');
  window.location.reload();
}, 2000);


