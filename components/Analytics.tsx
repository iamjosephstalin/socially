import React from 'react';
import { Post, PostStatus } from '../types';
import { EyeIcon, ThumbUpIcon, ChatAltIcon, RefreshIcon, DocumentTextIcon, DownloadIcon } from './icons/Icons';
import PostCard from './PostCard';

interface AnalyticsProps {
  posts: Post[];
}

const Analytics: React.FC<AnalyticsProps> = ({ posts }) => {
  const postedPosts = posts.filter(p => p.status === PostStatus.POSTED);

  const totalImpressions = postedPosts.reduce((sum, p) => sum + p.analytics.impressions, 0);
  const totalLikes = postedPosts.reduce((sum, p) => sum + p.analytics.likes, 0);
  const totalComments = postedPosts.reduce((sum, p) => sum + p.analytics.comments, 0);
  const totalReposts = postedPosts.reduce((sum, p) => sum + p.analytics.reposts, 0);
  
  const topPosts = [...postedPosts].sort((a, b) => b.analytics.impressions - a.analytics.impressions).slice(0, 3);

  const engagementRate = totalImpressions > 0 ? ((totalLikes + totalComments + totalReposts) / totalImpressions) * 100 : 0;

  const stats = [
    { icon: EyeIcon, value: totalImpressions.toLocaleString(), label: 'Total Impressions' },
    { icon: ThumbUpIcon, value: totalLikes.toLocaleString(), label: 'Total Likes' },
    { icon: ChatAltIcon, value: totalComments.toLocaleString(), label: 'Total Comments' },
    { icon: RefreshIcon, value: totalReposts.toLocaleString(), label: 'Total Reposts' },
    { icon: DocumentTextIcon, value: postedPosts.length, label: 'Posts Published' },
    { icon: ThumbUpIcon, value: `${engagementRate.toFixed(2)}%`, label: 'Engagement Rate' },
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-text-primary">Analytics Overview</h2>
        <button onClick={handleExport} className="flex items-center justify-center px-4 py-2 bg-surface text-text-primary text-sm font-semibold rounded-lg border border-border-color hover:bg-surface-accent transition-colors shadow-sm">
            <DownloadIcon className="w-5 h-5 mr-2" />
            Export Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-surface p-6 rounded-xl shadow-subtle">
             <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <div className="bg-surface-accent p-2.5 rounded-full">
                    <stat.icon className="h-5 w-5 text-primary" />
                </div>
            </div>
            <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl shadow-subtle">
           <h3 className="text-xl font-semibold text-text-primary mb-4">Impressions (Last 7 Days)</h3>
           <div className="flex justify-between items-end h-64 border-l border-b border-border-color pl-4 pb-4">
              {weeklyData.map(item => (
                <div key={item.day} className="flex flex-col items-center justify-end h-full w-full">
                   <div 
                      className="w-4/5 bg-primary rounded-t-md hover:bg-primary-hover transition-colors" 
                      style={{ height: `${(item.impressions / maxImpressions) * 100}%` }}
                      title={`${item.impressions.toLocaleString()} impressions`}
                    ></div>
                   <p className="text-xs text-text-secondary mt-2">{item.day}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Top Posts */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-text-primary">Top Performing Posts</h3>
          {topPosts.length > 0 ? (
            <div className="space-y-4">
              {topPosts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface rounded-xl border border-dashed border-border-color">
              <p className="text-text-secondary">Publish posts to see their performance here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;