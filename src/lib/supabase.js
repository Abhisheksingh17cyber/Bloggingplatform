import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions

// Auth functions
export const signUp = async (email, password, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      }
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
}

// Blog functions
export const getBlogs = async (category = 'All', searchQuery = '') => {
  let query = supabase
    .from('blogs')
    .select(`
      *,
      author:profiles(id, username, profile_image, bio)
    `)
    .order('created_at', { ascending: false })

  if (category !== 'All') {
    query = query.eq('category', category)
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
  }

  const { data, error } = await query
  return { data, error }
}

export const getBlogById = async (id) => {
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:profiles(id, username, profile_image, bio, email)
    `)
    .eq('id', id)
    .single()

  if (data) {
    // Increment views
    await supabase.rpc('increment_blog_views', { blog_uuid: id })
  }

  return { data, error }
}

export const createBlog = async (blogData) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('blogs')
    .insert([{
      ...blogData,
      author_id: user.id,
      excerpt: blogData.content.substring(0, 150) + '...'
    }])
    .select(`
      *,
      author:profiles(id, username, profile_image, bio)
    `)
    .single()

  return { data, error }
}

export const updateBlog = async (id, blogData) => {
  const { data, error } = await supabase
    .from('blogs')
    .update(blogData)
    .eq('id', id)
    .select(`
      *,
      author:profiles(id, username, profile_image, bio)
    `)
    .single()

  return { data, error }
}

export const deleteBlog = async (id) => {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id)

  return { error }
}

// Comment functions
export const getComments = async (blogId) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles(id, username, profile_image)
    `)
    .eq('blog_id', blogId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const createComment = async (blogId, content) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('comments')
    .insert([{
      blog_id: blogId,
      user_id: user.id,
      content
    }])
    .select(`
      *,
      user:profiles(id, username, profile_image)
    `)
    .single()

  return { data, error }
}

export const deleteComment = async (id) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  return { error }
}

// Like functions
export const toggleLike = async (blogId) => {
  const { data: { user } } = await supabase.auth.getUser()

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('blog_id', blogId)
    .eq('user_id', user.id)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id)
    
    return { isLiked: false, error }
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert([{
        blog_id: blogId,
        user_id: user.id
      }])
    
    return { isLiked: true, error }
  }
}

export const checkIfLiked = async (blogId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('blog_id', blogId)
    .eq('user_id', user.id)
    .single()

  return !!data
}

// Profile functions
export const getUserBlogs = async (userId) => {
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:profiles(id, username, profile_image, bio)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const updateProfile = async (profileData) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single()

  return { data, error }
}

// Admin functions
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

export const getAllBlogsAdmin = async () => {
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:profiles(id, username, profile_image)
    `)
    .order('created_at', { ascending: false })

  return { data, error }
}