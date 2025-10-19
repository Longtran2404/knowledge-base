const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('🏗️  Setting up Supabase Storage...\n');

  const buckets = [
    {
      name: 'workflows',
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['application/json', 'text/plain'],
    },
    {
      name: 'videos',
      public: false, // Private
      fileSizeLimit: 500 * 1024 * 1024, // 500MB
      allowedMimeTypes: ['video/*'],
    },
    {
      name: 'documents',
      public: true,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.*'],
    },
    {
      name: 'images',
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/*'],
    },
  ];

  // Step 1: Check existing buckets
  console.log('📋 Checking existing buckets...');
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('❌ Error listing buckets:', listError.message);
    return;
  }

  const existingNames = existingBuckets?.map((b) => b.name) || [];
  console.log(`   Found ${existingNames.length} existing buckets:`, existingNames.join(', ') || 'none');
  console.log('');

  // Step 2: Create missing buckets
  console.log('🔨 Creating buckets...\n');

  for (const bucket of buckets) {
    if (existingNames.includes(bucket.name)) {
      console.log(`✅ Bucket "${bucket.name}" already exists (${bucket.public ? 'public' : 'private'})`);
      continue;
    }

    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });

      if (error) {
        console.error(`❌ Failed to create "${bucket.name}":`, error.message);
      } else {
        console.log(`✅ Created bucket: ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      }
    } catch (err) {
      console.error(`💥 Error creating "${bucket.name}":`, err.message);
    }
  }

  console.log('\n📊 Storage setup complete!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Go to Supabase Dashboard → Storage');
  console.log('   2. Configure RLS policies for each bucket');
  console.log('   3. Test upload at: http://localhost:3000/upload');
  console.log('');
  console.log('💡 To set policies, run SQL in Supabase SQL Editor:');
  console.log('   See: STORAGE_SETUP.md for policy SQL');
}

setupStorage().catch(console.error);
