# 🎯 IMMEDIATE SETUP STEPS

Your project is **90% ready**! Just complete these 2 quick steps:

---

## ⚡ STEP 1: Get Your Anon Key (2 minutes)

1. **Open this link** (login to Supabase if needed):
   ```
   https://supabase.com/dashboard/project/wjkwokitgwpzlukjjgqo/settings/api
   ```

2. **Scroll down** to find "Project API keys"

3. **Copy the `anon` `public` key** - It looks like:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
   ```
   ⚠️ **DON'T copy the `service_role` key** - that's secret!

4. **Open your `.env` file** in VS Code

5. **Replace this line:**
   ```
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
   
   **With:**
   ```
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_ACTUAL_KEY
   ```

6. **Save the file** (Ctrl+S)

---

## ⚡ STEP 2: Create Database Tables (3 minutes)

1. **Open SQL Editor:**
   ```
   https://supabase.com/dashboard/project/wjkwokitgwpzlukjjgqo/sql
   ```

2. **Click "New Query"** button

3. **In VS Code**, open the file: `supabase-schema.sql`

4. **Select ALL** (Ctrl+A) and **Copy** (Ctrl+C)

5. **Go back to Supabase SQL Editor**, **Paste** (Ctrl+V) the entire SQL code

6. **Click "Run"** button (or press Ctrl+Enter)

7. You should see: ✅ **Success. No rows returned**

---

## 🚀 STEP 3: Test Your App!

Run in your terminal:
```powershell
npm run dev
```

Then open: http://localhost:5173

### Try These:
1. ✅ Click "Sign Up" - create account with email/password
2. ✅ Check your email for verification (check spam!)
3. ✅ Sign in with your credentials
4. ✅ Create a blog post
5. ✅ Like posts, add comments
6. ✅ View your profile

---

## ❓ Having Issues?

### "Missing Supabase environment variables"
- Check `.env` file has the correct anon key
- Restart dev server: Stop (Ctrl+C) then `npm run dev`

### "relation does not exist"
- You forgot Step 2! Run the SQL schema in Supabase

### Can't login?
- Check email for verification link
- Make sure you used correct password

---

## 📦 What's Already Done

✅ Supabase client configured  
✅ React app updated to use Supabase  
✅ Authentication system ready  
✅ Database schema created  
✅ All API functions ready  
✅ Supabase URL configured  

**Just need**: Anon key + Run SQL = DONE! 🎉

---

## 🌐 Next: Deploy to Production

Once local testing works:
1. Push code to GitHub
2. Deploy to Vercel/Netlify
3. Add environment variables there
4. Get your live URL!

Your blogging platform will be **LIVE** and ready to showcase! 🚀
