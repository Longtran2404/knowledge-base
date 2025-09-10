# Database Setup Instructions

## Overview
This directory contains the SQL schema and sample data for the Nam Long Center learning management system. The database is designed to work with Supabase PostgreSQL.

## Database Structure

### Core Tables
- **users**: Extended user profiles (linked to Supabase auth.users)
- **categories**: Course categories
- **courses**: Course information and content
- **purchases**: User course purchases and transactions
- **user_course_progress**: Learning progress tracking
- **course_reviews**: Course ratings and reviews
- **user_certificates**: Generated certificates for completed courses

### Key Features
- Row Level Security (RLS) enabled on all tables
- Automatic user profile creation on registration
- Comprehensive course management system
- Progress tracking and certification
- Secure purchase and payment tracking

## Setup Instructions

### 1. Connect to Supabase
1. Go to your Supabase project dashboard
2. Navigate to the SQL editor
3. Run the schema and sample data scripts

### 2. Run Database Schema
```sql
-- Copy and paste the contents of schema.sql into Supabase SQL editor
-- This will create all tables, policies, and functions
```

### 3. Setup Storage for Avatar Uploads
```sql
-- Copy and paste the contents of storage-setup.sql into Supabase SQL editor
-- This will create the storage bucket and policies for user avatars
```

### 4. Insert Sample Data (Optional)
```sql
-- Copy and paste the contents of sample-data.sql into Supabase SQL editor
-- This will populate the database with sample courses and categories
```

### 5. Verify Setup
After running the scripts, you should have:
- 5 categories (BIM & Revit, AutoCAD, Kết cấu, Quản lý dự án, Kiến trúc)
- 7 sample courses with detailed information
- Complete RLS policies for data security
- Automatic triggers for user creation and timestamps
- Storage bucket 'user-avatars' with appropriate policies for avatar uploads

## Environment Variables Required
Make sure your `.env.local` file contains:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Testing the Database
1. Register a new user through the application
2. Check if user profile is automatically created
3. Purchase a course and verify the transaction
4. Test course progress tracking
5. Leave a review and check if it appears

## Security Notes
- All tables use Row Level Security (RLS)
- Users can only access their own data
- Course data is publicly readable but only admin-writable
- Purchase data is strictly user-restricted
- Authentication is handled by Supabase Auth

## Maintenance
- Regular backups are handled by Supabase
- Monitor database performance through Supabase dashboard
- Update course content through the courses table
- User data is automatically cleaned up when users delete their accounts