/**
 * Test Supabase Connection
 * Kiểm tra kết nối đến Supabase project
 */

const https = require('https');

const SUPABASE_URL = 'https://byidgbgvnrfhujprzzge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw';

console.log('🔍 Testing Supabase Connection...\n');
console.log('Project URL:', SUPABASE_URL);
console.log('Project ID: byidgbgvnrfhujprzzge\n');

// Test 1: Health Check
console.log('📡 Test 1: Health Check Endpoint');
const healthUrl = new URL('/auth/v1/health', SUPABASE_URL);

https.get(healthUrl, (res) => {
  console.log('✅ Connection successful!');
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
    testRestAPI();
  });
}).on('error', (err) => {
  console.error('❌ Connection failed!');
  console.error('Error:', err.message);
  console.error('\n⚠️  Possible issues:');
  console.error('1. Supabase project chưa được tạo hoặc đã bị pause');
  console.error('2. URL không đúng - kiểm tra lại Project URL trên Supabase Dashboard');
  console.error('3. Network/Firewall đang block kết nối');
  console.error('4. DNS chưa propagate (nếu project mới tạo, chờ 5-10 phút)\n');

  console.log('🔧 Hướng dẫn khắc phục:');
  console.log('1. Truy cập: https://supabase.com/dashboard/projects');
  console.log('2. Kiểm tra project "byidgbgvnrfhujprzzge" có tồn tại không');
  console.log('3. Nếu project bị pause, click "Resume" để kích hoạt lại');
  console.log('4. Copy lại Project URL và API keys từ Settings > API');
  process.exit(1);
});

// Test 2: REST API
function testRestAPI() {
  console.log('\n📡 Test 2: REST API Endpoint');
  const restUrl = new URL('/rest/v1/', SUPABASE_URL);

  const options = {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  };

  https.get(restUrl, options, (res) => {
    console.log('✅ REST API accessible!');
    console.log('Status Code:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response:', data.substring(0, 200));
      console.log('\n✅ All tests passed! Supabase connection is working.');
    });
  }).on('error', (err) => {
    console.error('❌ REST API test failed!');
    console.error('Error:', err.message);
  });
}
