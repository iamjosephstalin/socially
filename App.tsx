import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Calendar from './components/Calendar';
import Automate from './components/Automate';
import Profile from './components/Profile';
import AppSettings from './components/AppSettings';
import PostComposer from './components/PostComposer';
import PostViewModal from './components/PostViewModal';
import Toast from './components/Toast';
import LandingPage from './components/LandingPage';
import { Post, User, Automation, PostStatus } from './types';
import { apiService } from './services/apiService';

type View = 'dashboard' | 'history' | 'calendar' | 'automate' | 'profile' | 'settings';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>({
    id: 'mock-user-123',
    name: 'Demo User',
    email: 'demo@example.com',
    avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff',
  });
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  // FIX: Removed deletingPost state, as this is now handled within the History component to avoid redundant logic.
  const [toastMessage, setToastMessage] = useState('');
  const [composerDefaultDate, setComposerDefaultDate] = useState<Date | undefined>(undefined);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      await loadData();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleSignup = async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await apiService.signup(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      await loadData();
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    apiService.logout();
    
    // Reset all state
    setIsAuthenticated(false);
    setUser(null);
    setPosts([]);
    setAutomations([]);
    setActiveView('dashboard');
    
    // Close any open modals
    setIsComposerOpen(false);
    setPostToEdit(null);
    setViewingPost(null);
    setToastMessage('');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, automationsData] = await Promise.all([
        apiService.getPosts(),
        apiService.getAutomations()
      ]);
      setPosts(postsData);
      setAutomations(automationsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh posts when switching to dashboard or history views (manual refresh only)
  useEffect(() => {
    if (isAuthenticated && (activeView === 'dashboard' || activeView === 'history')) {
      loadData();
    }
  }, [activeView, isAuthenticated]);

  const handleSavePost = async (post: Post) => {
    try {
      if (postToEdit) {
        // Update existing post
        const updatedPost = await apiService.updatePost(post.id, {
          content: post.content,
          scheduledAt: post.scheduledAt,
          status: post.status,
          images: post.image ? [post.image] : []
        });
        setPosts(posts.map(p => p.id === post.id ? updatedPost : p));
        setToastMessage(post.status === PostStatus.POSTED ? 'Post published successfully!' : 'Post updated successfully!');
      } else {
        // Create new post
        const newPost = await apiService.createPost({
          content: post.content,
          scheduledAt: post.scheduledAt,
          images: post.image ? [post.image] : []
        });
        setPosts([newPost, ...posts]);
        setToastMessage(post.status === PostStatus.POSTED ? 'Post published successfully!' : 'Post scheduled successfully!');
      }
      setIsComposerOpen(false);
      setPostToEdit(null);
      await loadData(); // Reload to get latest data
    } catch (error) {
      console.error('Failed to save post:', error);
      setToastMessage('Failed to save post. Please try again.');
    }
  };

  const handleDeletePost = async (post: Post) => {
    try {
      await apiService.deletePost(post.id);
      setPosts(posts.filter(p => p.id !== post.id));
      setToastMessage('Post deleted successfully!');
    } catch (error) {
      console.error('Failed to delete post:', error);
      setToastMessage('Failed to delete post. Please try again.');
    }
  };

  const handleCompose = () => {
    setPostToEdit(null);
    setComposerDefaultDate(undefined);
    setIsComposerOpen(true);
  };

  const handleEdit = (post: Post) => {
    setPostToEdit(post);
    setIsComposerOpen(true);
  };

  const handleView = (post: Post) => {
    setViewingPost(post);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    // Ensure dates are Date objects, not strings
    const postWithDates = {
      ...updatedPost,
      scheduledAt: updatedPost.scheduledAt instanceof Date ? updatedPost.scheduledAt : new Date(updatedPost.scheduledAt),
      postedAt: updatedPost.postedAt ? (updatedPost.postedAt instanceof Date ? updatedPost.postedAt : new Date(updatedPost.postedAt)) : undefined,
      analytics: updatedPost.analytics || { impressions: 0, likes: 0, comments: 0, reposts: 0 }
    };
    setPosts(posts.map(p => p.id === updatedPost.id ? postWithDates : p));
  };

  const openComposerForDate = (date: Date) => {
    setPostToEdit(null);
    setComposerDefaultDate(date);
    setIsComposerOpen(true);
  };

  // Auto-authenticate and load data on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Skip authentication, load mock data
        await loadData();

        // Handle LinkedIn OAuth callback if present
        const urlParams = new URLSearchParams(window.location.search);
        const linkedinConnected = urlParams.get('linkedin_connected');
        const linkedinError = urlParams.get('linkedin_error');

        if (linkedinConnected === 'true') {
          window.history.replaceState({}, '', window.location.pathname);
          setToastMessage('LinkedIn account connected successfully!');
          // Navigate to profile if not already there
          if (activeView !== 'profile') {
            setActiveView('profile');
          }
        }

        if (linkedinError) {
          window.history.replaceState({}, '', window.location.pathname);
          setToastMessage('Failed to connect LinkedIn account. Please try again.');
        }
      } catch (error) {
        console.error('App initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading...</p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard posts={posts} onCompose={handleCompose} onEdit={handleEdit} onView={handleView} onUpdate={handleUpdatePost} />;
      case 'history':
        return <History posts={posts} onEdit={handleEdit} onView={handleView} onDelete={handleDeletePost} onUpdate={handleUpdatePost} />;
      case 'calendar':
        return <Calendar posts={posts} onEdit={handleEdit} onView={handleView} onAddPostOnDate={openComposerForDate} />;
      case 'automate':
        return <Automate automations={automations} setAutomations={setAutomations} />;
      case 'profile':
        return user ? (
          <Profile 
            user={user} 
            setUser={setUser} 
            onSettingsClick={() => setActiveView('settings')}
            key={activeView} // Force remount when switching to profile view
          />
        ) : null;
      case 'settings':
        return <AppSettings onClose={() => setActiveView('profile')} />;
      default:
        return <Dashboard posts={posts} onCompose={handleCompose} onEdit={handleEdit} onView={handleView} />;
    }
  };


  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <LandingPage 
        onLoginClick={() => {
          // For now, auto-login the demo user
          setIsAuthenticated(true);
          setUser({
            id: 'mock-user-123',
            name: 'Demo User',
            email: 'demo@example.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff',
          });
          loadData();
        }} 
        onSignupClick={() => {
          // For now, auto-login the demo user
          setIsAuthenticated(true);
          setUser({
            id: 'mock-user-123',
            name: 'Demo User',
            email: 'demo@example.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff',
          });
          loadData();
        }}
        onPrivacyClick={() => {
          // Handle privacy policy click if needed
          console.log('Privacy policy clicked');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 text-gray-900 font-sans relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"></div>
      
      {/* Main Content */}
      <div className="relative flex w-full h-full">
        <Sidebar activeView={activeView} onNavigate={setActiveView} onCompose={handleCompose} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {user && <Header user={user} onProfileClick={() => setActiveView('profile')} onLogout={handleLogout} />}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {renderView()}
            </div>
          </main>
        </div>
      </div>

      {isComposerOpen && (
        <PostComposer
          postToEdit={postToEdit}
          onSave={handleSavePost}
          onClose={() => setIsComposerOpen(false)}
          defaultDate={composerDefaultDate}
        />
      )}
      {viewingPost && <PostViewModal post={viewingPost} onClose={() => setViewingPost(null)} />}
      {/* FIX: Removed ConfirmationDialog from App component as it's now self-contained in History component. */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default App;

