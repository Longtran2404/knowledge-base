/**
 * Test Supabase Connection
 * Quick script to verify Supabase credentials are working
 * 
 * Usage:
 * 1. Make sure .env file exists with credentials
 * 2. Run: node scripts/test-supabase-connection.js
 */

require('dotenv').config();

const testConnection = async () => {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Check environment variables
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  console.log('📋 Configuration Check:');
  console.log('  SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('  SUPABASE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  console.log('  URL Value:', supabaseUrl || 'Not set');
  console.log('  Key Length:', supabaseKey ? `${supabaseKey.length} chars` : 'Not set');
  console.log('');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables!');
    console.error('   Please create .env file with:');
    console.error('   REACT_APP_SUPABASE_URL=your-url');
    console.error('   REACT_APP_SUPABASE_ANON_KEY=your-key');
    process.exit(1);
  }
  
  // Test network connectivity
  console.log('🌐 Testing Network Connectivity...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok || response.status === 404) {
      console.log('  ✅ Network connection successful');
      console.log('  Status:', response.status, response.statusText);
    } else {
      console.log('  ⚠️  Unexpected status:', response.status);
    }
  } catch (error) {
    console.error('  ❌ Network connection failed:', error.message);
    if (error.message.includes('ENOTFOUND')) {
      console.error('  💡 DNS resolution failed - check if project exists');
      console.error('  💡 Project might be paused or deleted');
    }
    process.exit(1);
  }
  
  console.log('');
  console.log('✅ Supabase connection test passed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Clear browser localStorage');
  console.log('2. Restart development server');
  console.log('3. Open http://localhost:3000');
};

// Run test
testConnection().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});


