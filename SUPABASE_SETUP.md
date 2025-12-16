# 🚀 Supabase Backend Setup Guide

## 📋 Prerequisites
- Supabase account (free tier works)
- Your Supabase project URL: `wjkwokitgwpzlukjjgqo`

## 🔧 Step-by-Step Setup

### 1. Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard/project/wjkwokitgwpzlukjjgqo
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (looks like: `https://wjkwokitgwpzlukjjgqo.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2. Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://wjkwokitgwpzlukjjgqo.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 3. Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard:
   https://supabase.com/dashboard/project/wjkwokitgwpzlukjjgqo/sql
2. Click **New Query**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** to execute the SQL

This will create:
- ✅ `profiles` table (user profiles)
- ✅ `blogs` table (blog posts)
- ✅ `comments` table (blog comments)
- ✅ `likes` table (blog likes tracking)
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers and functions
- ✅ Sample data (4 blogs, 2 comments, 4 users)

### 4. Enable Email Authentication (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if desired

### 5. Test the Database

1. Go to **Table Editor** in Supabase
2. You should see:
   - `profiles`: 4 sample users
   - `blogs`: 4 sample blog posts
   - `comments`: 2 sample comments

### 6. Start Your Application

```bash
npm run dev
```

Your app will now use Supabase as the backend! 🎉

## 🔐 Authentication Setup

The app now supports real authentication:

### Sign Up Flow
```javascript
import { signUp } from './lib/supabase'

const { data, error } = await signUp(email, password, username)
```

### Sign In Flow
```javascript
import { signIn } from './lib/supabase'

const { data, error } = await signIn(email, password)
```

### Sign Out
```javascript
import { signOut } from './lib/supabase'

await signOut()
```

## 📊 Database Structure

### Tables Created

#### `profiles`
- User profile information
- Automatically created on signup
- Fields: id, username, email, profile_image, bio, is_admin

#### `blogs`
- Blog posts with all content
- Fields: id, title, content, excerpt, category, cover_image, tags, likes, views, author_id

#### `comments`
- Comments on blog posts
- Fields: id, content, blog_id, user_id

#### `likes`
- Tracks which users liked which blogs
- Auto-updates blog.likes count
- Fields: id, blog_id, user_id

## 🔒 Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only edit/delete their own content
- ✅ Public read access for blogs and comments
- ✅ Authenticated users can create content
- ✅ Admin roles supported

## 🎯 API Functions Available

### Blogs
- `getBlogs(category, searchQuery)` - Get all blogs with filters
- `getBlogById(id)` - Get single blog (auto-increments views)
- `createBlog(blogData)` - Create new blog
- `updateBlog(id, blogData)` - Update existing blog
- `deleteBlog(id)` - Delete blog

### Comments
- `getComments(blogId)` - Get comments for a blog
- `createComment(blogId, content)` - Add comment
- `deleteComment(id)` - Delete comment

### Likes
- `toggleLike(blogId)` - Like/unlike a blog
- `checkIfLiked(blogId)` - Check if user liked blog

### Auth
- `signUp(email, password, username)` - Register new user
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `getCurrentUser()` - Get logged-in user profile

### Profile
- `getUserBlogs(userId)` - Get user's blogs
- `updateProfile(profileData)` - Update user profile

### Admin
- `getAllUsers()` - Get all users (admin only)
- `getAllBlogsAdmin()` - Get all blogs (admin only)

## 🔄 Next Steps

1. ✅ Install Supabase client: `npm install @supabase/supabase-js` (Done)
2. ⏳ Configure `.env` with your credentials
3. ⏳ Run SQL schema in Supabase dashboard
4. ⏳ Update React components to use Supabase functions
5. ⏳ Test authentication flow
6. ⏳ Deploy to production

## 🐛 Troubleshooting

### Error: Missing Supabase environment variables
- Check that `.env` file exists
- Verify values are correctly set
- Restart dev server after updating `.env`

### Error: relation "public.profiles" does not exist
- Run the SQL schema in Supabase SQL Editor
- Refresh the page after running

### Authentication not working
- Enable Email provider in Supabase Authentication settings
- Check RLS policies are properly set

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

Your BlogHub platform is now powered by Supabase! 🚀