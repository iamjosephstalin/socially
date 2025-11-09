import React, { useState, useEffect, useRef } from 'react';
import { Post, PostStatus } from '../types';
import { generatePostSuggestion } from '../services/geminiService';
import { initialUser } from '../services/mockData';
import { apiService } from '../services/apiService';
import { XIcon, SparklesIcon, CalendarIcon, PhotographIcon, DocumentTextIcon, PencilIcon, SpinnerIcon } from './icons/Icons';

interface PostComposerProps {
    postToEdit?: Post | null;
    onSave: (post: Post) => Promise<void>;
    onClose: () => void;
    defaultDate?: Date;
}

type ComposerTab = 'write' | 'ai';

const PostComposer: React.FC<PostComposerProps> = ({ postToEdit, onSave, onClose, defaultDate }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [scheduledAt, setScheduledAt] = useState('');
    const [activeTab, setActiveTab] = useState<ComposerTab>('write');
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // AI Assistant State
    const [topic, setTopic] = useState('Productivity Tip');
    const [customTopic, setCustomTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (postToEdit) {
            setContent(postToEdit.content);
            setImage(postToEdit.image || null);
            setScheduledAt(formatDateForInput(postToEdit.scheduledAt));
        } else {
            const defaultScheduleDate = defaultDate || new Date(Date.now() + 60 * 60 * 1000);
            setScheduledAt(formatDateForInput(defaultScheduleDate));
        }
    }, [postToEdit, defaultDate]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    function formatDateForInput(date: Date) {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    }

    const handleGenerateSuggestion = async () => {
        const topicToUse = customTopic.trim() || topic;
        if (!topicToUse) return;

        setIsGenerating(true);
        const suggestion = await generatePostSuggestion(topicToUse);
        if (suggestion) {
            setContent(suggestion);
            setActiveTab('write'); // Switch to write tab to show preview
        }
        setIsGenerating(false);
    };

    const handleSave = async (status: PostStatus.DRAFT | PostStatus.SCHEDULED) => {
        if (!content.trim() || !scheduledAt) {
            alert('Post content and schedule date are required.');
            return;
        }
        
        setIsSaving(true);
        const scheduledDate = new Date(scheduledAt);
        const newPost: Post = {
            id: postToEdit?.id || `post-${Date.now()}`,
            content,
            status: status,
            scheduledAt: scheduledDate,
            image: image || undefined,
            analytics: postToEdit?.analytics || { impressions: 0, likes: 0, comments: 0, reposts: 0 },
        };
        await onSave(newPost);
        setIsSaving(false);
    };

    const handlePostNow = async () => {
        if (!content.trim()) {
            alert('Post content is required.');
            return;
        }

        setIsPublishing(true);
        try {
            const scheduledDate = new Date();
            let postId = postToEdit?.id;

            // If it's a new post, create it first
            if (!postId) {
                const newPostData = {
                    content,
                    scheduledAt: scheduledDate,
                    images: image ? [image] : [],
                    status: PostStatus.DRAFT
                };
                const createdPost = await apiService.createPost(newPostData);
                postId = createdPost.id;
            } else {
                // Update existing post with current content
                await apiService.updatePost(postId, {
                    content,
                    scheduledAt: scheduledDate,
                    images: image ? [image] : []
                });
            }

            if (!postId) {
                throw new Error('Failed to get post ID');
            }

            // Publish to LinkedIn
            const publishedPost = await apiService.publishPost(postId);
            
            // Update the UI with the published post
            await onSave({
                ...publishedPost,
                scheduledAt: new Date(publishedPost.scheduledAt),
                postedAt: publishedPost.postedAt ? new Date(publishedPost.postedAt) : undefined
            });
            
            alert('Post published to LinkedIn successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to publish post:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to publish post to LinkedIn';
            alert(errorMessage);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const suggestionTopics = ['Productivity Tip', 'Industry News', 'Hiring Announcement', 'Company Update', 'Personal Reflection'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-surface rounded-xl shadow-lg w-full max-w-4xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-border-color flex-shrink-0 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <TabButton icon={PencilIcon} label="Write" isActive={activeTab === 'write'} onClick={() => setActiveTab('write')} />
                        <TabButton icon={SparklesIcon} label="AI Assistant" isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-accent">
                        <XIcon className="h-5 w-5 text-text-secondary" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'write' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                            {/* Left: Editor */}
                            <div className="flex flex-col">
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="What do you want to talk about?"
                                    className="w-full p-2 bg-transparent text-text-primary text-base resize-none focus:outline-none flex-1 hide-scrollbar"
                                />
                            </div>
                             {/* Right: Preview */}
                            <div>
                                <h3 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wider">Live Preview</h3>
                                <div className="bg-white border border-border-color rounded-lg p-4 space-y-3 aspect-[1/1.2] overflow-y-auto hide-scrollbar">
                                    <div className="flex items-center space-x-2">
                                        <img src={initialUser.avatarUrl} className="h-10 w-10 rounded-full" alt="User avatar" />
                                        <div>
                                            <p className="font-semibold text-sm text-text-primary">{initialUser.name}</p>
                                            <p className="text-xs text-text-secondary">Just now</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-primary whitespace-pre-wrap break-words">{content || "Your post content will appear here..."}</p>
                                    {image && (
                                         <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
                                            <img src={image} alt="Post preview" className="absolute top-0 left-0 rounded-lg w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                     {activeTab === 'ai' && (
                        <div className="p-6 space-y-4">
                            <h3 className="text-lg font-bold text-text-primary">AI Content Assistant</h3>
                            <p className="text-sm text-text-secondary">Let our AI help you craft the perfect post. Choose a predefined topic or enter your own.</p>
                            
                             <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Predefined Topics</label>
                                <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-surface border border-border-color rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                                    {suggestionTopics.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Custom Topic</label>
                                 <input
                                    type="text"
                                    value={customTopic}
                                    onChange={e => setCustomTopic(e.target.value)}
                                    placeholder="e.g., 'The importance of UX in SaaS products'"
                                    className="w-full bg-surface border border-border-color rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                             <button onClick={handleGenerateSuggestion} disabled={isGenerating} className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-accent text-primary rounded-lg hover:bg-primary-accent/80 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                {isGenerating ? <SpinnerIcon className="h-5 w-5"/> : <SparklesIcon className="h-5 w-5" />}
                                <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-border-color flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <label htmlFor="image-upload" className="cursor-pointer text-text-secondary hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-accent">
                            <PhotographIcon className="h-6 w-6" />
                            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                         <div className="flex items-center space-x-2">
                             <CalendarIcon className="h-5 w-5 text-text-secondary"/>
                             <input 
                                type="datetime-local" 
                                value={scheduledAt}
                                onChange={e => setScheduledAt(e.target.value)}
                                className="bg-surface-accent border border-border-color rounded-md px-2 py-1.5 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                            />
                         </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                        <button 
                            onClick={() => handleSave(PostStatus.DRAFT)} 
                            disabled={isSaving || isPublishing} 
                            className="w-full sm:w-auto px-4 py-2.5 bg-surface text-text-primary rounded-lg border border-border-color hover:bg-surface-accent transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSaving && <SpinnerIcon className="h-4 w-4 mr-2"/>}
                            Save Draft
                        </button>
                        <button 
                            onClick={() => handleSave(PostStatus.SCHEDULED)} 
                            disabled={isSaving || isPublishing} 
                            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSaving && <SpinnerIcon className="h-4 w-4 mr-2"/>}
                            {postToEdit ? 'Save Changes' : 'Schedule Post'}
                        </button>
                        <button 
                            onClick={handlePostNow} 
                            disabled={isSaving || isPublishing || !content.trim()} 
                            className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isPublishing ? (
                                <>
                                    <SpinnerIcon className="h-4 w-4 mr-2"/>
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Post Now
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{icon: React.FC<any>, label: string, isActive: boolean, onClick: () => void}> = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
            isActive ? 'bg-primary-accent text-primary' : 'text-text-secondary hover:bg-surface-accent'
        }`}
    >
        <Icon className="h-5 w-5"/>
        <span>{label}</span>
    </button>
);

export default PostComposer;