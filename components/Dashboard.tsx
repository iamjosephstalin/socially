import React, { useEffect, useState } from 'react';
import { Post, PostStatus } from '../types';
import PostCard from './PostCard';
// FIX: Removed unused ChatAltIcon and RefreshIcon imports
import { PlusIcon, EyeIcon, ThumbUpIcon, DocumentTextIcon, DownloadIcon, TrendingUpIcon, UsersIcon, HeartIcon, MessageCircleIcon, ShareIcon, ClockIcon } from './icons/Icons';

interface DashboardProps {
  posts: Post[];
  onCompose: () => void;
  onEdit: (post: Post) => void;
  onView: (post: Post) => void;
  onUpdate?: (post: Post) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ posts, onCompose, onEdit, onView, onUpdate }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const postedPosts = posts.filter(p => p.status === PostStatus.POSTED);
  const scheduledPosts = posts
    .filter(p => p.status === PostStatus.SCHEDULED)
    .sort((a, b) => {
      const aDate = a.scheduledAt instanceof Date ? a.scheduledAt : new Date(a.scheduledAt);
      const bDate = b.scheduledAt instanceof Date ? b.scheduledAt : new Date(b.scheduledAt);
      return aDate.getTime() - bDate.getTime();
    });

  const totalImpressions = postedPosts.reduce((sum, p) => sum + p.analytics.impressions, 0);
  const totalLikes = postedPosts.reduce((sum, p) => sum + p.analytics.likes, 0);
  const totalComments = postedPosts.reduce((sum, p) => sum + p.analytics.comments, 0);
  const totalReposts = postedPosts.reduce((sum, p) => sum + p.analytics.reposts, 0);
  const engagementRate = totalImpressions > 0 ? ((totalLikes + totalComments + totalReposts) / totalImpressions) * 100 : 0;
  const topPosts = [...postedPosts].sort((a, b) => b.analytics.impressions - a.analytics.impressions).slice(0, 3);

  // Calculate growth percentages (mock data for demo)
  const stats = [
    { 
      icon: EyeIcon, 
      value: totalImpressions.toLocaleString(), 
      label: 'Total Impressions',
      change: '+12.5%',
      changeType: 'positive' as const,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: TrendingUpIcon, 
      value: `${engagementRate.toFixed(1)}%`, 
      label: 'Engagement Rate',
      change: '+8.2%',
      changeType: 'positive' as const,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      icon: DocumentTextIcon, 
      value: postedPosts.length.toString(), 
      label: 'Posts Published',
      change: '+5',
      changeType: 'positive' as const,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      icon: HeartIcon, 
      value: totalLikes.toLocaleString(), 
      label: 'Total Likes',
      change: '+23.1%',
      changeType: 'positive' as const,
      gradient: 'from-red-500 to-orange-500'
    },
  ];
  
  // Dummy data for chart
  const weeklyData = [
    { day: 'Mon', impressions: 12000 },
    { day: 'Tue', impressions: 18000 },
    { day: 'Wed', impressions: 15000 },
    { day: 'Thu', impressions: 22000 },
    { day: 'Fri', impressions: 19000 },
    { day: 'Sat', impressions: 25000 },
    { day: 'Sun', impressions: 23000 },
  ];
  const maxImpressions = Math.max(...weeklyData.map(d => d.impressions), 1);

  const handleExport = () => {
    const headers = ["ID", "Content", "Status", "ScheduledAt", "PostedAt", "ImageURL", "Impressions", "Likes", "Comments", "Reposts"];
    const rows = posts.map(p => [
        p.id,
        `"${p.content.replace(/"/g, '""')}"`,
        p.status,
        p.scheduledAt.toISOString(),
        p.postedAt?.toISOString() || 'N/A',
        p.image || 'N/A',
        p.analytics.impressions,
        p.analytics.likes,
        p.analytics.comments,
        p.analytics.reposts
    ].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "socially_posts_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-8 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Compact Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-cyan-600/5 backdrop-blur-sm border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back! Here's what's happening with your content today.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <button 
              onClick={onCompose} 
              className="group relative px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center space-x-2">
                <PlusIcon className="w-4 h-4" />
                <span>Create Post</span>
              </div>
            </button>
            <button 
              onClick={handleExport} 
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 transition-all duration-200"
            >
              <div className="flex items-center space-x-2">
                <DownloadIcon className="w-4 h-4" />
                <span>Export</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all duration-300 hover:-translate-y-1">
            {/* Content */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-sm`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                  stat.changeType === 'positive' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {stat.change}
                </div>
              </div>
              
              <div>
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Compact Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
              <p className="text-sm text-gray-500 mt-0.5">Last 7 days impression trends</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
              <span>Impressions</span>
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-end h-48 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-10">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-px bg-gray-300"></div>
              ))}
            </div>
            
            {/* Chart Bars */}
            {weeklyData.map((item, index) => (
              <div key={item.day} className="flex flex-col items-center justify-end h-full w-full group">
                <div className="relative w-10 flex items-end justify-center h-full">
                  {/* Main Bar */}
                  <div 
                    className="relative w-8 bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-lg shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-105 cursor-pointer"
                    style={{ 
                      height: `${(item.impressions / maxImpressions) * 100}%`,
                    }}
                    title={`${item.impressions.toLocaleString()} impressions`}
                  >
                  </div>
                  
                  {/* Value Display on Hover */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    {item.impressions.toLocaleString()}
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mt-2 group-hover:text-purple-600 transition-colors">
                  {item.day}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Scheduled Posts */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
              <ClockIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Posts</h3>
              <p className="text-sm text-gray-500">Ready to go live</p>
            </div>
          </div>
          
          {scheduledPosts.length > 0 ? (
            <div className="space-y-3">
              {scheduledPosts.slice(0, 3).map((post, index) => (
                <PostCard key={post.id} post={post} showActions onEdit={() => onEdit(post)} onView={() => onView(post)} onUpdate={onUpdate} />
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6 text-center">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg mx-auto flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">No scheduled posts yet</p>
                  <p className="text-xs text-gray-500 mb-4">Create your first scheduled post to get started</p>
                </div>
                <button 
                  onClick={onCompose} 
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium text-sm rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Schedule a Post
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Top Performing Posts */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <TrendingUpIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Performing</h3>
              <p className="text-sm text-gray-500">Your best content</p>
            </div>
          </div>
          
          {topPosts.length > 0 ? (
            <div className="space-y-3">
              {topPosts.map((post, index) => (
                <PostCard key={post.id} post={post} onView={() => onView(post)} onUpdate={onUpdate} />
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 text-center">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mx-auto flex items-center justify-center">
                  <TrendingUpIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">No posts published yet</p>
                  <p className="text-xs text-gray-500">Publish posts to see their performance here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
