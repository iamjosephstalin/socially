import React, { useState, useMemo } from 'react';
import { Post, PostStatus } from '../types';
import PostCard from './PostCard';
import ConfirmationDialog from './ConfirmationDialog';
import { SearchIcon, FilterIcon } from './icons/Icons';

interface HistoryProps {
  posts: Post[];
  onView: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => Promise<void>;
  onUpdate?: (post: Post) => void;
}

const History: React.FC<HistoryProps> = ({ posts, onView, onEdit, onDelete, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAndSortedPosts = useMemo(() => {
    return posts
      .filter(post => {
        const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Ensure scheduledAt is a Date object
        const aDate = a.scheduledAt instanceof Date ? a.scheduledAt : new Date(a.scheduledAt);
        const bDate = b.scheduledAt instanceof Date ? b.scheduledAt : new Date(b.scheduledAt);
        
        if (sortBy === 'newest') {
          return bDate.getTime() - aDate.getTime();
        } else {
          return aDate.getTime() - bDate.getTime();
        }
      });
  }, [posts, searchTerm, statusFilter, sortBy]);

  const statusOptions: { value: PostStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: PostStatus.POSTED, label: 'Posted' },
    { value: PostStatus.SCHEDULED, label: 'Scheduled' },
    { value: PostStatus.DRAFT, label: 'Draft' },
    { value: PostStatus.ERROR, label: 'Error' },
  ];

  const handleDeleteConfirm = async () => {
    if (postToDelete) {
        setIsDeleting(true);
        await onDelete(postToDelete);
        setIsDeleting(false);
        setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Post History</h2>

      {/* Filters and Search */}
      <div className="bg-surface p-4 rounded-xl shadow-subtle space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <div className="relative w-full md:w-1/3">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-accent border border-border-color rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center">
                <FilterIcon className="h-5 w-5 text-text-secondary mr-2"/>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as PostStatus | 'all')}
                    className="bg-surface-accent border border-border-color rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                >
                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="bg-surface-accent border border-border-color rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-sm"
            >
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
            </select>
        </div>
      </div>
      
      {/* Posts Grid */}
      {filteredAndSortedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              showActions 
              onView={onView} 
              onEdit={onEdit} 
              onDelete={setPostToDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface rounded-xl border-2 border-dashed border-border-color">
            <p className="text-text-secondary font-semibold">No posts found.</p>
            <p className="text-text-secondary mt-2">Try adjusting your search or filters.</p>
        </div>
      )}

      {postToDelete && (
        <ConfirmationDialog
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPostToDelete(null)}
          isConfirming={isDeleting}
        />
      )}
    </div>
  );
};

export default History;