# 🔧 GET YOUR SUPABASE ANON KEY - Step by Step

## ⚠️ IMPORTANT: You Need the Actual API Key!

Your `.env` file currently has a placeholder. Follow these steps to get the real key:

---

## 📍 STEP 1: Open Supabase Dashboard

Click this link (you may need to login):
```
https://supabase.com/dashboard/project/wjkwokitgwpzlukjjgqo/settings/api
```

---

## 📍 STEP 2: Find "Project API keys" Section

Scroll down the page until you see a section called **"Project API keys"**

You'll see two keys:
1. ✅ **anon** `public` - This is what you need!
2. ❌ **service_role** `secret` - DON'T use this one!

---

## 📍 STEP 3: Copy the Anon Key

1. Find the key labeled: **`anon`** `public`
2. Click the **copy icon** next to it
3. The key looks like this (very long JWT token):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indqa3dva2l0Z3dwemx1a2pqZ3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc1MjEyMzQsImV4cCI6MjAwMzA5NzIzNH0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

## 📍 STEP 4: Update Your .env File

1. Open `.env` file in VS Code (it should already be open)
2. Find this line:
   ```
   VITE_SUPABASE_ANON_KEY=your_anon_key_here_replace_with_actual_key
   ```
3. Replace `your_anon_key_here_replace_with_actual_key` with the key you copied
4. Final result should look like:
   ```
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
   ```
5. **Save the file** (Ctrl + S)

---

## 📍 STEP 5: Set Up Database Tables

1. Open SQL Editor:
   ```
   https://supabase.com/dashboard/project/wjkwokitgwpzlukjjgqo/sql
   ```

2. Click **"New Query"** button (top right)

3. In VS Code, open `supabase-schema.sql` file

4. **Select All** (Ctrl + A) and **Copy** (Ctrl + C)

5. Go back to Supabase SQL Editor and **Paste** (Ctrl + V)

6. Click **"Run"** button (or press Ctrl + Enter)

7. You should see: ✅ **"Success. No rows returned"**

---

## 📍 STEP 6: Test Your Application

### Start the dev server:
```powershell
npm run dev
```

### Open in browser:
```
http://localhost:5173
```

### Test these features:
1. ✅ Click **"Sign Up"** - create a new account
2. ✅ Check your **email** for verification link (check spam!)
3. ✅ **Sign In** with your email/password
4. ✅ **Create** a blog post
5. ✅ **Like** and **comment** on posts
6. ✅ View your **profile** page

---

## ✅ Checklist

- [ ] Got anon key from Supabase dashboard
- [ ] Updated `.env` file with real anon key
- [ ] Saved `.env` file
- [ ] Ran SQL schema in Supabase SQL Editor
- [ ] Started dev server: `npm run dev`
- [ ] Tested sign up and login
- [ ] Created a blog post
- [ ] Everything works! 🎉

---

## 🐛 Common Issues

### "Missing Supabase environment variables"
- Make sure you **saved** the `.env` file after adding the key
- **Restart** the dev server (Ctrl+C, then `npm run dev`)

### "relation 'public.profiles' does not exist"
- You need to run the SQL schema (Step 5)
- Make sure you clicked "Run" in SQL Editor

### Can't find the anon key
- Make sure you're on the **API Settings** page
- Look for **"Project API keys"** section (scroll down)
- Copy the **anon** key (NOT service_role)

### Login not working
- Check spam folder for verification email
- Make sure Email auth is enabled in Supabase

---

## 🎯 What Happens After Setup

Once you complete these steps:
- ✅ Real user authentication
- ✅ Blogs saved in Supabase database
- ✅ Comments and likes working
- ✅ User profiles created automatically
- ✅ Secure data with Row Level Security
- ✅ Ready to deploy to production!

---

## 🚀 Next: Deploy Your App

After local testing works:
1. Push code to GitHub
2. Deploy to **Vercel** or **Netlify**
3. Add environment variables in hosting dashboard
4. Get your **live URL** to showcase! 🌐

Your blogging platform will be **LIVE** on the internet! 🎉
