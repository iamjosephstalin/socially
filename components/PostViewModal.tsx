
import React from 'react';
import { Post, PostStatus } from '../types';
import { XIcon, EyeIcon, ThumbUpIcon, ChatAltIcon, RefreshIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon, DocumentTextIcon } from './icons/Icons';

interface PostViewModalProps {
  post: Post;
  onClose: () => void;
}

const PostViewModal: React.FC<PostViewModalProps> = ({ post, onClose }) => {
    const getStatusInfo = () => {
        switch (post.status) {
            case PostStatus.POSTED:
                return {
                icon: CheckCircleIcon,
                color: 'text-green-700 bg-green-100',
                label: `Posted on ${post.postedAt?.toLocaleString()}`,
                };
            case PostStatus.SCHEDULED:
                return {
                icon: ClockIcon,
                color: 'text-amber-700 bg-amber-100',
                label: `Scheduled for ${post.scheduledAt?.toLocaleString()}`,
                };
            case PostStatus.ERROR:
                return {
                icon: ExclamationCircleIcon,
                color: 'text-red-700 bg-red-100',
                label: 'Posting Failed',
                };
            case PostStatus.DRAFT:
            default:
                return {
                icon: DocumentTextIcon,
                color: 'text-gray-600 bg-gray-100',
                label: 'Draft',
                };
        }
    };

    const { icon: StatusIcon, color: statusColor, label: statusLabel } = getStatusInfo();
    
    const stats = [
        { icon: EyeIcon, value: post.analytics.impressions.toLocaleString(), label: 'Impressions' },
        { icon: ThumbUpIcon, value: post.analytics.likes.toLocaleString(), label: 'Likes' },
        { icon: ChatAltIcon, value: post.analytics.comments.toLocaleString(), label: 'Comments' },
        { icon: RefreshIcon, value: post.analytics.reposts.toLocaleString(), label: 'Reposts' },
    ];


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-2xl m-4 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border-color flex-shrink-0 flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-primary">Post Details</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-accent">
              <XIcon className="h-5 w-5 text-text-secondary" />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{maxHeight: '80vh'}}>
            <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-full ${statusColor}`}>
                    <StatusIcon className="h-5 w-5"/>
                </div>
                <div>
                    <p className="font-semibold text-text-primary">{statusLabel}</p>
                    {post.status === PostStatus.ERROR && <p className="text-sm text-red-600">{post.errorMessage}</p>}
                </div>
            </div>

            {post.image && (
                <div className="mb-4">
                    <img src={post.image} alt="Post visual" className="rounded-lg max-h-80 w-full object-cover" />
                </div>
            )}
            
            <div className="bg-surface-accent p-4 rounded-lg">
                <p className="text-base text-text-primary whitespace-pre-wrap">{post.content}</p>
            </div>

            {post.status === PostStatus.POSTED && (
                <div className="mt-6">
                    <h3 className="text-md font-semibold text-text-primary mb-3">Performance</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {stats.map(stat => (
                            <div key={stat.label} className="bg-surface border border-border-color p-4 rounded-lg text-center">
                                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                                <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                                <p className="text-xs text-text-secondary">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PostViewModal;
