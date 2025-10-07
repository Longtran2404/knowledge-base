# 🚨 QUICK FIX: Supabase Connection Error

## The Problem

Your app can't connect to Supabase because the project `byidgbgvnrfhujprzzge` doesn't exist or is paused.

## Quick Fix (5 minutes)

### Option A: Restore Existing Project

1. **Login to Supabase**

   ```
   https://app.supabase.com/
   ```

2. **Find your project** (`byidgbgvnrfhujprzzge`)

   - If PAUSED: Click "Restore Project"
   - If DELETED: Go to Option B

3. **Get your credentials**

   - Go to: Settings → API
   - Copy: **Project URL** and **anon/public key**

4. **Create `.env` file** in project root:

   ```env
   REACT_APP_SUPABASE_URL=https://byidgbgvnrfhujprzzge.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

5. **Clear browser storage**

   - Open DevTools (F12)
   - Console tab
   - Paste: `localStorage.clear(); location.reload();`

6. **Restart dev server**
   ```bash
   # Ctrl+C to stop, then:
   npm start
   ```

### Option B: Create New Project

1. **Create new Supabase project**

   ```
   https://app.supabase.com/new
   ```

   - Name: Nam Long Center
   - Region: Choose closest to you
   - Password: Create a strong password

2. **Setup database**

   - Go to: SQL Editor
   - Copy all content from `database/setup.sql`
   - Paste and click "Run"

3. **Get credentials**

   - Go to: Settings → API
   - Copy: **Project URL** and **anon/public key**

4. **Create `.env` file**:

   ```env
   REACT_APP_SUPABASE_URL=https://your-new-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-new-anon-key
   REACT_APP_API_URL=http://localhost:3001
   REACT_APP_APP_URL=http://localhost:3000
   REACT_APP_ENVIRONMENT=development
   REACT_APP_ENABLE_DEBUG=true
   ```

5. **Clear browser storage**

   ```javascript
   localStorage.clear();
   location.reload();
   ```

6. **Restart dev server**
   ```bash
   npm start
   ```

## Verify It's Fixed

✅ Console should show:

- No `ERR_NAME_NOT_RESOLVED` errors
- "Auth state initialized" messages
- No infinite refresh loops

❌ If still broken:

1. Check `.env` file is in correct location (same folder as `package.json`)
2. Verify credentials are correct (no extra spaces, quotes, etc.)
3. Make sure dev server restarted completely

## Important Notes

⚠️ **Never commit `.env` file to git** (already in .gitignore ✅)

⚠️ **Free Supabase projects pause after 7 days of inactivity**

- Solution: Visit dashboard weekly OR upgrade to paid plan

⚠️ **If using multiple machines**

- Each machine needs its own `.env` file
- Or use environment variable management (Vercel, etc.)

## Need More Help?

See `SUPABASE_CONNECTION_FIX.md` for detailed troubleshooting.

---

**TL;DR:** Create `.env` file with real Supabase credentials → Clear localStorage → Restart server

