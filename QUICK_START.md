# 🚀 Quick Start Guide - Supabase Integration

Your React blogging platform is now connected to Supabase! Follow these steps to complete the setup:

## ✅ What's Already Done

- ✅ Supabase client library installed
- ✅ React components updated to use Supabase
- ✅ Authentication system integrated (Sign Up/Sign In/Sign Out)
- ✅ Blog CRUD operations connected
- ✅ Comments system integrated
- ✅ Like functionality connected
- ✅ Supabase URL configured in .env

## 📋 Next Steps (Required)

### Step 1: Get Your Supabase Anon Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/wjkwokitgwpzlukjjgqo/settings/api
2. Copy the `anon` `public` key (NOT the service_role key)
3. Open the `.env` file in your project
4. Replace `your_supabase_anon_key_here` with your actual anon key

Your `.env` should look like:
```
VITE_SUPABASE_URL=https://wjkwokitgwpzlukjjgqo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Set Up Database Tables

1. Go to SQL Editor: https://supabase.com/dashboard/project/wjkwokitgwpzlukjjgqo/sql
2. Click "New Query"
3. Open the `supabase-schema.sql` file from your project (it's currently open in your editor)
4. Copy ALL the content from that file
5. Paste it into the SQL Editor
6. Click "Run" to create all tables, policies, and sample data

This will create:
- `profiles` table (user data)
- `blogs` table (blog posts)
- `comments` table (blog comments)
- `likes` table (blog likes)
- Row Level Security (RLS) policies for security
- Triggers for automatic updates
- Sample data to get started

### Step 3: Enable Email Authentication (Optional)

1. Go to Authentication settings: https://supabase.com/dashboard/project/wjkwokitgwpzlukjjgqo/auth/providers
2. Make sure "Email" provider is enabled
3. Configure email templates if needed

### Step 4: Test Your Application

1. Restart your development server:
```powershell
npm run dev
```

2. Open http://localhost:5173

3. Try the following:
   - Click "Sign Up" to create a new account
   - Verify your email (check spam folder)
   - Sign in with your credentials
   - Create a blog post
   - Like and comment on posts
   - View your profile

## 🔍 What Changed

### Authentication
- Real user registration with email verification
- Secure password authentication
- Session management with Supabase Auth
- Automatic profile creation on signup

### Data Fetching
- Blogs loaded from Supabase database
- Real-time data updates possible (can be added)
- Proper error handling

### Data Structure
The app now uses Supabase field names:
- `cover_image` instead of `coverImage`
- `created_at` instead of `createdAt`
- `profiles` table instead of nested `author` object
- `user_likes` array for like status

### Security
- Row Level Security (RLS) enabled
- Users can only edit/delete their own content
- Secure API key usage (anon key only)

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file has your actual anon key
- Restart the dev server after updating .env

### "relation does not exist" error
- You need to run the SQL schema (Step 2 above)
- Make sure all tables are created

### Authentication not working
- Check if Email provider is enabled in Supabase
- Verify your email after signup
- Check browser console for errors

### Images not showing
- Default placeholder images are used if no cover_image is provided
- You can add image URLs when creating blogs

## 📚 Additional Resources

- Supabase Documentation: https://supabase.com/docs
- React + Supabase Guide: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
- Your Project Dashboard: https://supabase.com/dashboard/project/wjkwokitgwpzlukjjgqo

## 🚀 Ready to Deploy?

Once everything works locally:
1. Update environment variables in your hosting platform (Vercel/Netlify)
2. Deploy using existing configs:
   - Netlify: `netlify.toml` is ready
   - Vercel: `vercel.json` is ready

Your app is ready to go live! 🎉
