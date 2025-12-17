import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, PenSquare, User, LogOut, Search, Heart, MessageCircle, 
  Eye, Clock, Tag, TrendingUp, BookOpen, Users, FileText,
  ChevronRight, Menu, X, Settings, Trash2, Edit, Plus
} from 'lucide-react';
import { 
  supabase,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getComments,
  createComment,
  deleteComment,
  toggleLike,
  checkIfLiked,
  getUserBlogs,
  updateProfile,
  getAllUsers,
  getAllBlogsAdmin
} from './lib/supabase';

const categories = ['All', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business'];

export default function BloggingPlatform() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    category: 'Technology',
    coverImage: '',
    tags: ''
  });
  
  // Login form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (mounted) {
            setUser(profile);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    initAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch blogs on mount and when category changes
  useEffect(() => {
    if (isLoggedIn || !loading) {
      fetchBlogs();
    }
  }, [selectedCategory, isLoggedIn, loading]);

  // Fetch comments when blog is selected
  useEffect(() => {
    if (selectedBlog?.id) {
      fetchComments(selectedBlog.id);
    }
  }, [selectedBlog?.id]);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await getBlogs(selectedCategory, searchQuery);
      if (error) throw error;
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (blogId) => {
    try {
      const { data, error } = await getComments(blogId);
      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
      const matchesSearch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           blog.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [blogs, selectedCategory, searchQuery]);

  const handleLike = async (blogId) => {
    if (!isLoggedIn) {
      alert('Please login to like blogs');
      return;
    }
    
    try {
      await toggleLike(blogId);
      // Update state locally instead of refetching
      setBlogs(blogs.map(blog => {
        if (blog.id === blogId) {
          const isLiked = blog.user_likes?.length > 0;
          return {
            ...blog,
            likes: isLiked ? blog.likes - 1 : blog.likes + 1,
            user_likes: isLiked ? [] : [{ user_id: user.id }]
          };
        }
        return blog;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Please login to comment');
      return;
    }
    
    if (newComment.trim()) {
      try {
        const { data, error } = await createComment(selectedBlog.id, newComment);
        if (error) throw error;
        setComments([data, ...comments]);
        setNewComment('');
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment');
      }
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Please login to create blogs');
      return;
    }
    
    try {
      const tags = blogForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const { data, error } = await createBlog({
        title: blogForm.title,
        content: blogForm.content,
        category: blogForm.category,
        cover_image: blogForm.coverImage,
        tags,
      });
      if (error) throw error;
      
      setBlogs([data, ...blogs]);
      setBlogForm({ title: '', content: '', category: 'Technology', coverImage: '', tags: '' });
      setCurrentPage('home');
      alert('Blog created successfully!');
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Failed to create blog');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!isLoggedIn) {
      alert('Please login to delete blogs');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this blog?')) {
      return;
    }
    
    try {
      const { error } = await deleteBlog(blogId);
      if (error) throw error;
      setBlogs(blogs.filter(b => b.id !== blogId));
      if (selectedBlog?.id === blogId) {
        setSelectedBlog(null);
        setCurrentPage('home');
      }
      alert('Blog deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsLoggedIn(false);
      setCurrentPage('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60 / 60 / 24);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Navbar Component
  const Navbar = () => (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}
              className="flex items-center space-x-2 group"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BlogHub
              </span>
            </button>
            
            <div className="hidden md:flex space-x-1">
              {[
                { name: 'Home', icon: Home, page: 'home' },
                { name: 'Create', icon: PenSquare, page: 'create' },
                { name: 'Profile', icon: User, page: 'profile' }
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentPage === item.page
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
              {user?.is_admin && (
                <button
                  onClick={() => setCurrentPage('admin')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentPage === 'admin'
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                </button>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
              <img src={user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt={user?.username} className="w-8 h-8 rounded-full" />
              <span className="font-medium text-gray-700">{user?.username}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            {[
              { name: 'Home', icon: Home, page: 'home' },
              { name: 'Create', icon: PenSquare, page: 'create' },
              { name: 'Profile', icon: User, page: 'profile' }
            ].map((item) => (
              <button
                key={item.page}
                onClick={() => { setCurrentPage(item.page); setIsMobileMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg hover:bg-gray-50"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
            {user?.is_admin && (
              <button
                onClick={() => { setCurrentPage('admin'); setIsMobileMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                <span>Admin Dashboard</span>
              </button>
            )}
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-3 px-4 py-2">
                <img src={user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt={user?.username} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-medium text-gray-800">{user?.username}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  // Home Page
  const HomePage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 mb-8 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Discover Amazing Stories
        </h1>
        <p className="text-xl md:text-2xl opacity-90 mb-6">
          Explore, create, and share your thoughts with the world
        </p>
        <button 
          onClick={() => setCurrentPage('create')}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
        >
          <PenSquare className="w-5 h-5" />
          <span>Start Writing</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles, topics, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBlogs()}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FileText, label: 'Total Posts', value: blogs.length, color: 'blue' },
          { icon: Users, label: 'Active Writers', value: '1.2K', color: 'green' },
          { icon: TrendingUp, label: 'Monthly Views', value: '45.2K', color: 'purple' },
          { icon: Heart, label: 'Total Likes', value: '23.5K', color: 'red' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
            <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <div 
            key={blog.id}
            className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => { setSelectedBlog(blog); setCurrentPage('detail'); }}
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={blog.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'} 
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                  {blog.category}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {blog.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {blog.excerpt}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {(blog.tags || []).slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <img 
                    src={blog.author?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author?.username}`} 
                    alt={blog.author?.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{blog.author?.username}</p>
                    <p className="text-xs text-gray-500">{formatDate(blog.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 text-gray-600 text-sm">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Heart className={`w-4 h-4 ${blog.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{blog.likes_count || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{blog.comments_count || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{blog.views || 0}</span>
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBlogs.length === 0 && !loading && (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );

  // Blog Detail Page
  const BlogDetailPage = () => {
    if (!selectedBlog) return null;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => setCurrentPage('home')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span>Back to all posts</span>
        </button>

        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <img 
            src={selectedBlog.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'} 
            alt={selectedBlog.title}
            className="w-full h-96 object-cover"
          />

          <div className="p-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold">
                {selectedBlog.category}
              </span>
              <span className="flex items-center space-x-1 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatDate(selectedBlog.created_at)}</span>
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {selectedBlog.title}
            </h1>

            <div className="flex items-center justify-between mb-8 pb-8 border-b">
              <div className="flex items-center space-x-3">
                <img 
                  src={selectedBlog.author?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBlog.author?.username}`} 
                  alt={selectedBlog.author?.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">{selectedBlog.author?.username}</p>
                  <p className="text-sm text-gray-500">Author</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleLike(selectedBlog.id); }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    selectedBlog.is_liked
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${selectedBlog.is_liked ? 'fill-current' : ''}`} />
                  <span className="font-semibold">{selectedBlog.likes_count || 0}</span>
                </button>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Eye className="w-5 h-5" />
                  <span>{selectedBlog.views || 0} views</span>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />

            <div className="flex flex-wrap gap-2 mb-8">
              {(selectedBlog.tags || []).map((tag, idx) => (
                <span key={idx} className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  <Tag className="w-4 h-4" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>

            {/* Comments Section */}
            <div className="border-t pt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <MessageCircle className="w-6 h-6" />
                <span>Comments ({comments.length})</span>
              </h3>

              <form onSubmit={handleAddComment} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  rows="3"
                />
                <button 
                  type="submit"
                  className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Post Comment
                </button>
              </form>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={comment.user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.username}`} 
                        alt={comment.user?.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{comment.user?.username}</span>
                          <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  };

  // Create Blog Page
  const CreateBlogPage = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
          <PenSquare className="w-8 h-8 text-blue-600" />
          <span>Create New Blog Post</span>
        </h1>

        <form onSubmit={handleCreateBlog} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={blogForm.title}
              onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
              placeholder="Enter an engaging title..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={blogForm.category}
                onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              >
                {categories.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={blogForm.tags}
                onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                placeholder="React, JavaScript, Tutorial"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image URL</label>
            <input
              type="url"
              value={blogForm.coverImage}
              onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
            <textarea
              value={blogForm.content}
              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
              placeholder="Write your amazing story here..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
              rows="12"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Tip: You can use HTML tags for formatting (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;)
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Publish Post</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                setBlogForm({ title: '', content: '', category: 'Technology', coverImage: '', tags: '' });
                setCurrentPage('home');
              }}
              className="px-8 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Profile Page
  const ProfilePage = () => {
    const [userBlogs, setUserBlogs] = useState([]);

    useEffect(() => {
      const fetchUserBlogs = async () => {
        if (user) {
          const { data, error } = await getUserBlogs(user.id);
          if (error) {
            console.error("Error fetching user blogs:", error);
          } else {
            setUserBlogs(data);
          }
        }
      };
      fetchUserBlogs();
    }, [user]);

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center space-x-6">
            <img 
              src={user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
              alt={user?.username}
              className="w-24 h-24 rounded-full border-4 border-white shadow-xl"
            />
            <div>
              <h1 className="text-3xl font-bold mb-2">{user?.username}</h1>
              <p className="text-xl opacity-90 mb-4">{user?.bio || 'No bio yet'}</p>
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-2xl font-bold">{userBlogs.length}</p>
                  <p className="text-sm opacity-80">Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{userBlogs.reduce((acc, b) => acc + (b.likes_count || 0), 0)}</p>
                  <p className="text-sm opacity-80">Likes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{userBlogs.reduce((acc, b) => acc + (b.views || 0), 0)}</p>
                  <p className="text-sm opacity-80">Views</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Blog Posts</h2>
        </div>

        {userBlogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <PenSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Start sharing your thoughts with the world</p>
            <button 
              onClick={() => setCurrentPage('create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userBlogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={blog.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'} 
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {blog.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{blog.likes_count || 0} likes</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{blog.views || 0} views</span>
                    </span>
                    <span>{formatDate(blog.created_at)}</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <button 
                      onClick={() => { setSelectedBlog(blog); setCurrentPage('detail'); }}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="flex items-center justify-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Admin Dashboard Page
  const AdminDashboardPage = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        const { data: users, error: usersError } = await getAllUsers();
        if (usersError) console.error("Error fetching users:", usersError);
        else setAllUsers(users);

        const { data: blogs, error: blogsError } = await getAllBlogsAdmin();
        if (blogsError) console.error("Error fetching blogs for admin:", blogsError);
        else setAllBlogs(blogs);
      };

      fetchData();
    }, []);
    return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
          <Settings className="w-8 h-8" />
          <span>Admin Dashboard</span>
        </h1>
        <p className="text-xl opacity-90">Manage users, posts, and platform settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Users, label: 'Total Users', value: allUsers.length, color: 'from-blue-500 to-blue-600' },
          { icon: FileText, label: 'Total Posts', value: allBlogs.length, color: 'from-green-500 to-green-600' },
          { icon: MessageCircle, label: 'Total Comments', value: '456', color: 'from-purple-500 to-purple-600' },
          { icon: TrendingUp, label: 'Engagement Rate', value: '78%', color: 'from-orange-500 to-orange-600' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className={`bg-gradient-to-r ${stat.color} p-4 text-white`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* All Posts Management */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <FileText className="w-6 h-6 text-purple-600" />
          <span>All Blog Posts</span>
        </h2>

        <div className="space-y-4">
          {allBlogs.map((blog) => (
            <div key={blog.id} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-purple-200 transition-colors">
              <div className="flex items-center space-x-4 flex-1">
                <img 
                  src={blog.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'} 
                  alt={blog.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{blog.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{blog.author?.username}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{blog.likes_count || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{blog.views || 0}</span>
                    </span>
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => { setSelectedBlog(blog); setCurrentPage('detail'); }}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteBlog(blog.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Users className="w-6 h-6 text-purple-600" />
          <span>User Management</span>
        </h2>

        <div className="space-y-4">
          {allUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-purple-200 transition-colors">
              <div className="flex items-center space-x-4">
                <img 
                  src={u.profile_image} 
                  alt={u.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{u.username}</h3>
                  <p className="text-sm text-gray-600">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {u.is_admin && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Admin
                  </span>
                )}
                <span className="text-sm text-gray-600">
                  {allBlogs.filter(b => b.author_id === u.id).length} posts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )};

  // Login Page
  const LoginPage = () => {
    const handleAuth = async (e) => {
      e.preventDefault();
      setAuthLoading(true);

      try {
        if (isSignUp) {
          const { error } = await signUp(email, password, username);
          if (error) {
            alert(error.message);
          } else {
            alert('Sign up successful! Please check your email to verify your account.');
          }
        } else {
          const { error } = await signIn(email, password);
          if (error) {
            alert(error.message);
          } else {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        alert('Authentication failed. Please try again.');
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to BlogHub
            </h2>
            <p className="text-gray-600 mt-2">
              {isSignUp ? 'Create your account' : 'Sign in to continue your journey'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 font-semibold ml-2 hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'detail' && <BlogDetailPage />}
      {currentPage === 'create' && <CreateBlogPage />}
      {currentPage === 'profile' && <ProfilePage />}
      {currentPage === 'admin' && user?.is_admin && <AdminDashboardPage />}
    </div>
  );
}