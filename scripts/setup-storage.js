/**
 * Setup Supabase Storage for file uploads
 * Run this script to create the necessary storage buckets
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // You need service key for admin operations

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  try {
    console.log('Setting up Supabase Storage...');

    // Create user-files bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('user-files', {
      public: true,
      allowedMimeTypes: [
        'image/*',
        'video/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/*'
      ],
      fileSizeLimit: 100 * 1024 * 1024, // 100MB max file size
    });

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      throw bucketError;
    }

    console.log('✅ user-files bucket created/verified');

    // Set up RLS policy for user-files bucket
    const policies = [
      {
        name: 'Users can upload their own files',
        definition: `(bucket_id = 'user-files'::text) AND (auth.uid()::text = (storage.foldername(name))[1])`,
        operation: 'INSERT'
      },
      {
        name: 'Users can view their own files',
        definition: `(bucket_id = 'user-files'::text) AND (auth.uid()::text = (storage.foldername(name))[1])`,
        operation: 'SELECT'
      },
      {
        name: 'Users can update their own files',
        definition: `(bucket_id = 'user-files'::text) AND (auth.uid()::text = (storage.foldername(name))[1])`,
        operation: 'UPDATE'
      },
      {
        name: 'Users can delete their own files',
        definition: `(bucket_id = 'user-files'::text) AND (auth.uid()::text = (storage.foldername(name))[1])`,
        operation: 'DELETE'
      },
      {
        name: 'Public files are viewable by everyone',
        definition: `(bucket_id = 'user-files'::text) AND EXISTS (
          SELECT 1 FROM user_files
          WHERE file_path LIKE CONCAT('https://', '${supabaseUrl.split('//')[1]}', '/storage/v1/object/public/user-files/', name)
          AND is_public = true
        )`,
        operation: 'SELECT'
      }
    ];

    for (const policy of policies) {
      try {
        console.log(`Setting up policy: ${policy.name}`);
        // Note: Policy creation requires SQL commands, typically done via Supabase dashboard
        console.log(`Policy definition: ${policy.definition}`);
      } catch (error) {
        console.warn(`Warning: Could not create policy "${policy.name}":`, error.message);
      }
    }

    console.log('\n✅ Storage setup completed!');
    console.log('\nNext steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Storage > Policies');
    console.log('3. Create the RLS policies mentioned above');
    console.log('4. Test file upload functionality');

  } catch (error) {
    console.error('❌ Storage setup failed:', error);
    process.exit(1);
  }
}

setupStorage();