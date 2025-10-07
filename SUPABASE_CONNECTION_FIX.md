# Supabase Connection Issue - Fix Guide

## Problem

Your application cannot connect to Supabase due to `ERR_NAME_NOT_RESOLVED` error for domain: `byidgbgvnrfhujprzzge.supabase.co`

## Root Cause

1. **Supabase project is paused or deleted** - Free tier projects get paused after 7 days of inactivity
2. **No environment variables configured** - The app is using hardcoded fallback credentials
3. **Expired auth tokens** - Old session tokens in localStorage are causing refresh loops

## Solution

### Step 1: Check Your Supabase Project Status

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Check if your project `byidgbgvnrfhujprzzge` exists
3. If paused, restore it
4. If deleted, create a new project

### Step 2: Get Your Supabase Credentials

1. Open your Supabase project
2. Go to **Settings** > **API**
3. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Create Environment Variables File

Create a `.env` file in the project root with:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
REACT_APP_API_URL=http://localhost:3001
REACT_APP_APP_URL=http://localhost:3000

# App Configuration
REACT_APP_APP_NAME=Nam Long Center
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_DEBUG=true
```

**Important:** Replace `your-project-ref` and `your-anon-key-here` with your actual credentials!

### Step 4: Clear Browser Storage

Open your browser console and run:

```javascript
// Clear all localStorage
localStorage.clear();

// Or specifically clear Supabase auth tokens
localStorage.removeItem("sb-nlc-auth-token");
localStorage.removeItem("supabase.auth.token");
```

Or manually:

1. Open DevTools (F12)
2. Go to **Application** tab > **Local Storage**
3. Delete all items starting with `sb-` or `supabase`

### Step 5: Update Supabase Config (Remove Hardcoded Fallback)

The file `src/lib/supabase-config.ts` contains hardcoded fallback credentials. Update lines 14-16:

**Before:**

```typescript
const FALLBACK_URL = "https://byidgbgvnrfhujprzzge.supabase.co";
const FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

**After:**

```typescript
// Remove fallback - force environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY must be set in .env file"
  );
}
```

### Step 6: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

### Step 7: Verify Connection

Open browser console and check for:

- ✅ No `ERR_NAME_NOT_RESOLVED` errors
- ✅ Successful Supabase auth initialization
- ✅ No WebSocket connection failures

## Quick Fix for Testing

If you need to test immediately without a Supabase project:

1. **Create a new free Supabase project** at https://app.supabase.com/
2. Run the database setup: Copy contents from `database/setup.sql`
3. Update `.env` with new credentials
4. Clear localStorage
5. Restart app

## Common Issues

### Issue: "Project not found"

**Solution:** Your old project was deleted. Create a new one.

### Issue: "Invalid API key"

**Solution:** Make sure you copied the **Anon/Public** key, not the Service Role key.

### Issue: Still getting errors after restart

**Solution:**

1. Make sure `.env` is in the project root (same folder as `package.json`)
2. Restart the dev server completely
3. Clear browser cache and localStorage

### Issue: WebSocket errors

**Solution:** These will stop once Supabase connection is working.

## Prevention

To prevent this issue in the future:

1. **Keep projects active** - Visit your Supabase dashboard weekly
2. **Use environment variables** - Never hardcode credentials
3. **Upgrade to paid plan** - Paid projects don't get paused
4. **Add .env to .gitignore** - Already done ✅

## Need Help?

If you're still having issues:

1. Check [Supabase Status Page](https://status.supabase.com/)
2. Review [Supabase Docs](https://supabase.com/docs)
3. Contact Supabase support

---

**Next Steps:** Complete the steps above, then I'll help you test the connection and fix any remaining issues.

