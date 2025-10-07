/**
 * Auto Setup Database - Tự động chạy SQL setup
 * Sử dụng Supabase service_role key để chạy SQL
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment
require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://byidgbgvnrfhujprzzge.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE';

console.log('🚀 Auto Setup Database for Nam Long Center\n');
console.log('📍 Project URL:', SUPABASE_URL);
console.log('📍 Using service_role key for admin access\n');

// Read SQL file
const sqlPath = path.join(__dirname, '..', 'database', 'setup.sql');

if (!fs.existsSync(sqlPath)) {
  console.error('❌ SQL file not found:', sqlPath);
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlPath, 'utf8');
console.log('✅ Loaded setup.sql');
console.log(`📄 File size: ${sqlContent.length} characters\n`);

// Parse SQL into executable chunks
function parseSQLToChunks(sql) {
  // Split by DO $$ blocks and individual statements
  const chunks = [];

  // Handle DO $$ blocks separately
  const doBlockRegex = /DO \$\$[\s\S]*?\$\$;/gi;
  const doBlocks = sql.match(doBlockRegex) || [];

  // Remove DO blocks from SQL
  let remainingSql = sql;
  doBlocks.forEach(block => {
    remainingSql = remainingSql.replace(block, '###DO_BLOCK###');
  });

  // Split remaining SQL by semicolons
  const statements = remainingSql.split(';').map(s => s.trim()).filter(s => s && !s.startsWith('--'));

  // Reconstruct with DO blocks
  let doBlockIndex = 0;
  statements.forEach(stmt => {
    if (stmt === '###DO_BLOCK###') {
      chunks.push(doBlocks[doBlockIndex++]);
    } else if (stmt.length > 5) {
      chunks.push(stmt + ';');
    }
  });

  return chunks;
}

// Execute SQL via Supabase REST API
async function executeSQLChunk(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec', SUPABASE_URL);

    const postData = JSON.stringify({ sql });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ success: true, data });
        } else {
          resolve({ success: false, status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Execute with psql directly (recommended)
async function setupWithManualInstructions() {
  console.log('⚠️  Direct SQL execution via API may have limitations.\n');
  console.log('🔧 RECOMMENDED APPROACH:\n');
  console.log('Option 1: Via Supabase Dashboard (Easiest)');
  console.log('  1. Go to: https://supabase.com/dashboard/project/byidgbgvnrfhujprzzge');
  console.log('  2. Click "SQL Editor"');
  console.log('  3. Click "New Query"');
  console.log('  4. Copy content from: database/setup.sql');
  console.log('  5. Paste and click "Run"');
  console.log('  6. Wait for completion\n');

  console.log('Option 2: Via psql command line');
  console.log('  psql "postgresql://postgres.byidgbgvnrfhujprzzge@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \\');
  console.log('    -f database/setup.sql\n');

  console.log('Option 3: Try automatic execution (May require RPC setup)');
  console.log('  Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('🚀 Attempting automatic execution...\n');

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Split SQL into manageable chunks
  const chunks = parseSQLToChunks(sqlContent);
  console.log(`📦 Split SQL into ${chunks.length} executable chunks\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const preview = chunk.substring(0, 80).replace(/\n/g, ' ');

    process.stdout.write(`[${i + 1}/${chunks.length}] Executing: ${preview}... `);

    try {
      // Try to execute via raw SQL
      const { data, error } = await supabase.rpc('exec', { sql: chunk });

      if (error) {
        console.log('❌', error.message);
        failCount++;
      } else {
        console.log('✅');
        successCount++;
      }
    } catch (err) {
      console.log('❌', err.message);
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Execution Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📦 Total: ${chunks.length}\n`);

  if (failCount > 0) {
    console.log('⚠️  Some SQL statements failed.');
    console.log('Please use Supabase Dashboard SQL Editor (Option 1) for reliable execution.\n');
  } else {
    console.log('✅ All SQL executed successfully!');
    console.log('🎉 Database setup complete!\n');
  }
}

// Main execution
(async () => {
  try {
    await setupWithManualInstructions();
  } catch (err) {
    console.error('❌ Setup failed:', err);
    console.error('\nPlease use manual approach via Supabase Dashboard.');
    process.exit(1);
  }
})();
