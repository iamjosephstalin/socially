import React, { useState, useEffect, useRef } from 'react';
import { Post, PostStatus } from '../types';
import { apiService } from '../services/apiService';
import { EyeIcon, PencilIcon, TrashIcon, DotsVerticalIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon, DocumentTextIcon, SpinnerIcon } from './icons/Icons';

interface PostCardProps {
  post: Post;
  showActions?: boolean;
  onView?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onUpdate?: (post: Post) => void; // Callback to update parent state
}

const PostCard: React.FC<PostCardProps> = ({ post, showActions = false, onView, onEdit, onDelete, onUpdate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusInfo = () => {
    switch (post.status) {
      case PostStatus.POSTED:
        return {
          icon: CheckCircleIcon,
          color: 'text-green-500',
          label: `Posted on ${post.postedAt?.toLocaleDateString()}`,
        };
      case PostStatus.SCHEDULED:
        return {
          icon: ClockIcon,
          color: 'text-amber-500',
          label: `Scheduled for ${post.scheduledAt?.toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'})}`,
        };
      case PostStatus.ERROR:
         return {
          icon: ExclamationCircleIcon,
          color: 'text-red-500',
          label: 'Posting Failed',
        };
      case PostStatus.DRAFT:
      default:
        return {
          icon: DocumentTextIcon,
          color: 'text-gray-500',
          label: 'Draft',
        };
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const { icon: StatusIcon, color: statusColor, label: statusLabel } = getStatusInfo();

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2" title={statusLabel}>
            <div className={`p-1 rounded-md ${
              post.status === PostStatus.POSTED ? 'bg-green-50' : 
              post.status === PostStatus.SCHEDULED ? 'bg-orange-50' : 
              post.status === PostStatus.ERROR ? 'bg-red-50' : 'bg-gray-50'
            }`}>
              <StatusIcon className={`h-3 w-3 ${statusColor}`} />
            </div>
            <span className={`${statusColor} text-xs font-medium truncate`}>{statusLabel}</span>
          </div>
          {showActions && (onEdit || onDelete) && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                <DotsVerticalIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg z-20 border border-gray-200 overflow-hidden">
                  <div className="py-1">
                    {onEdit && (
                      <button 
                        onClick={() => { if(onEdit) onEdit(post); setMenuOpen(false); }} 
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center transition-colors duration-200"
                      >
                        <PencilIcon className="h-3 w-3 mr-2"/> 
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => { if(onDelete) onDelete(post); setMenuOpen(false); }} 
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center transition-colors duration-200"
                      >
                        <TrashIcon className="h-3 w-3 mr-2"/> 
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{post.content}</p>
          {post.image && (
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={post.image} 
                alt="Post visual" 
                className="w-full h-24 object-cover transition-transform duration-200 group-hover:scale-105" 
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        {post.status === PostStatus.POSTED ? (
            <div className="flex items-center gap-2">
                <div className="flex space-x-3 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <EyeIcon className="h-3 w-3" />
                      <span className="font-medium text-gray-700">{post.analytics.impressions.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <ThumbUpIcon className="h-3 w-3" />
                      <span className="font-medium text-gray-700">{post.analytics.likes.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <ChatBubbleIcon className="h-3 w-3" />
                      <span className="font-medium text-gray-700">{post.analytics.comments.toLocaleString()}</span>
                    </span>
                </div>
                <button 
                  onClick={async () => {
                    if (!isRefreshing && onUpdate) {
                      setIsRefreshing(true);
                      try {
                        const analytics = await apiService.refreshPostAnalytics(post.id);
                        // Ensure analytics are numbers
                        const updatedAnalytics = {
                          impressions: Number(analytics.impressions || 0),
                          likes: Number(analytics.likes || 0),
                          comments: Number(analytics.comments || 0),
                          reposts: Number(analytics.reposts || 0)
                        };
                        onUpdate({ ...post, analytics: updatedAnalytics });
                      } catch (error: any) {
                        console.error('Failed to refresh analytics:', error);
                        const errorMessage = error?.response?.data?.error || error?.message || 'Failed to refresh analytics';
                        const errorDetails = error?.response?.data?.details || '';
                        
                        // Check if the error is about missing LinkedIn post ID
                        if (errorMessage.includes('LinkedIn post ID')) {
                          const shouldRepublish = confirm(
                            `${errorMessage}\n\nThis post may have been published before analytics tracking was added.\n\nWould you like to republish it to enable analytics tracking?`
                          );
                          if (shouldRepublish && onEdit) {
                            onEdit(post);
                          }
                        } else {
                          alert(errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage);
                        }
                      } finally {
                        setIsRefreshing(false);
                      }
                    }
                  }}
                  disabled={isRefreshing}
                  className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50 flex items-center"
                  title="Refresh analytics from LinkedIn"
                >
                  {isRefreshing ? <SpinnerIcon className="h-3 w-3 animate-spin" /> : '↻'}
                </button>
            </div>
        ) : post.status === PostStatus.SCHEDULED ? (
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 flex items-center space-x-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{scheduledAt.toLocaleDateString()} {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
                <button
                  onClick={async () => {
                    if (!isPublishing && onUpdate) {
                      setIsPublishing(true);
                      try {
                        const publishedPost = await apiService.publishPost(post.id);
                        // Ensure dates are Date objects
                        const postWithDates = {
                          ...publishedPost,
                          scheduledAt: publishedPost.scheduledAt instanceof Date ? publishedPost.scheduledAt : new Date(publishedPost.scheduledAt),
                          postedAt: publishedPost.postedAt ? (publishedPost.postedAt instanceof Date ? publishedPost.postedAt : new Date(publishedPost.postedAt)) : undefined,
                          analytics: publishedPost.analytics || { impressions: 0, likes: 0, comments: 0, reposts: 0 }
                        };
                        onUpdate(postWithDates);
                      } catch (error) {
                        console.error('Failed to publish post:', error);
                        alert(error instanceof Error ? error.message : 'Failed to publish post');
                      } finally {
                        setIsPublishing(false);
                      }
                    }
                  }}
                  disabled={isPublishing}
                  className="px-2 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isPublishing ? (
                    <>
                      <SpinnerIcon className="h-3 w-3" />
                      Posting...
                    </>
                  ) : (
                    'Post Now'
                  )}
                </button>
            </div>
        ) : (
            <span className="text-xs text-gray-500">Analytics will appear after posting</span>
        )}
        {onView && (
          <button onClick={() => onView(post)} className="text-xs font-medium text-purple-600 hover:text-purple-700 px-2 py-1 rounded border border-purple-200 hover:border-purple-300 transition-colors">
            View
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;