import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { UserIcon, PencilIcon, SpinnerIcon } from './icons/Icons';
import { apiService } from '../services/apiService';

interface ProfileProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  onSettingsClick?: () => void;
}

interface LinkedInAccount {
  id: string;
  linkedinProfileId: string;
  expiresAt: string;
  createdAt: string;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser, onSettingsClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user);
  const [isSaving, setIsSaving] = useState(false);
  const [linkedInAccount, setLinkedInAccount] = useState<LinkedInAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await apiService.updateUserProfile({
        name: formData.name,
        avatarUrl: formData.avatarUrl,
      });
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  useEffect(() => {
    loadLinkedInAccount();
  }, []);

  // Reload LinkedIn account when user changes (e.g., after OAuth callback)
  useEffect(() => {
    if (user) {
      loadLinkedInAccount();
    }
  }, [user?.id]);

  const loadLinkedInAccount = async () => {
    try {
      setLoadingAccount(true);
      const profile = await apiService.getUserProfile();
      if ((profile as any).linkedinAccounts && (profile as any).linkedinAccounts.length > 0) {
        setLinkedInAccount((profile as any).linkedinAccounts[0]);
      }
    } catch (error) {
      console.error('Failed to load LinkedIn account:', error);
    } finally {
      setLoadingAccount(false);
    }
  };

  const handleConnectLinkedIn = async () => {
    try {
      setIsConnecting(true);
      const authUrl = await apiService.getLinkedInAuthUrl();
      // Redirect to LinkedIn OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to get LinkedIn auth URL:', error);
      alert('Failed to connect LinkedIn. Please try again.');
      setIsConnecting(false);
    }
  };

  const isLinkedInExpired = () => {
    if (!linkedInAccount) return false;
    return new Date(linkedInAccount.expiresAt) < new Date();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Profile & Settings</h2>
        <div className="flex gap-3">
          {!isEditing && (
            <>
              {onSettingsClick && (
                <button 
                  onClick={onSettingsClick} 
                  className="flex items-center justify-center px-4 py-2 bg-surface text-text-primary text-sm font-semibold rounded-lg border border-border-color hover:bg-surface-accent transition-colors shadow-sm"
                >
                  App Settings
                </button>
              )}
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center justify-center px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-subtle">
        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
            <div className="relative">
                <img src={formData.avatarUrl} alt={formData.name} className="h-28 w-28 rounded-full object-cover ring-4 ring-primary-accent" />
                {isEditing && (
                     <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary-hover transition-colors">
                        <PencilIcon className="h-4 w-4" />
                        <input id="avatar-upload" type="file" className="hidden" />
                    </label>
                )}
            </div>
            <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                     <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="text-3xl font-bold text-text-primary bg-surface-accent border border-border-color rounded-lg px-3 py-1 w-full" />
                ) : (
                    <h3 className="text-3xl font-bold text-text-primary">{formData.name}</h3>
                )}
                 <p className="text-text-secondary mt-1">Content Creator</p>
            </div>
        </div>

        <div className="mt-8 border-t border-border-color pt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
                <label className="text-sm font-semibold text-text-secondary">Full Name</label>
                {isEditing ? (
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full bg-surface-accent border border-border-color rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none" />
                ) : (
                    <p className="mt-1 text-text-primary font-medium">{formData.name}</p>
                )}
            </div>
             <div>
                <label className="text-sm font-semibold text-text-secondary">Email Address</label>
                {isEditing ? (
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled className="mt-1 w-full bg-surface-accent border border-border-color rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none opacity-60 cursor-not-allowed" />
                ) : (
                    <p className="mt-1 text-text-primary font-medium">{formData.email}</p>
                )}
            </div>
             {formData.linkedinProfile && (
                <div>
                    <label className="text-sm font-semibold text-text-secondary">LinkedIn Profile</label>
                    {isEditing ? (
                        <input type="text" name="linkedinProfile" value={formData.linkedinProfile || ''} onChange={handleInputChange} className="mt-1 w-full bg-surface-accent border border-border-color rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none" />
                    ) : (
                        <a href={formData.linkedinProfile} target="_blank" rel="noopener noreferrer" className="mt-1 text-primary font-medium hover:underline">{formData.linkedinProfile}</a>
                    )}
                </div>
             )}
        </div>

        {/* LinkedIn Connection Section */}
        <div className="mt-8 border-t border-border-color pt-8">
            <h3 className="text-xl font-bold text-text-primary mb-4">LinkedIn Connection</h3>
            <div className="bg-surface-accent rounded-lg p-6">
                {loadingAccount ? (
                    <div className="flex items-center justify-center py-4">
                        <SpinnerIcon className="h-5 w-5" />
                        <span className="ml-2 text-text-secondary">Loading connection status...</span>
                    </div>
                ) : linkedInAccount ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-primary font-semibold">LinkedIn Account Connected</p>
                                <p className="text-sm text-text-secondary mt-1">
                                    Profile ID: {linkedInAccount.linkedinProfileId}
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                    Connected: {new Date(linkedInAccount.createdAt).toLocaleDateString()}
                                </p>
                                {isLinkedInExpired() && (
                                    <p className="text-xs text-red-500 mt-1">⚠️ Connection expired. Please reconnect.</p>
                                )}
                            </div>
                            <button
                                onClick={handleConnectLinkedIn}
                                disabled={isConnecting}
                                className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isConnecting ? (
                                    <>
                                        <SpinnerIcon className="h-4 w-4" />
                                        Connecting...
                                    </>
                                ) : (
                                    'Reconnect LinkedIn'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-primary font-semibold">No LinkedIn Account Connected</p>
                            <p className="text-sm text-text-secondary mt-1">
                                Connect your LinkedIn account to enable posting and automation features.
                            </p>
                        </div>
                        <button
                            onClick={handleConnectLinkedIn}
                            disabled={isConnecting}
                            className="px-6 py-3 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isConnecting ? (
                                <>
                                    <SpinnerIcon className="h-4 w-4" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-0.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h0.046c0.477-0.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-0.926-2.063-2.065 0-1.138 0.92-2.063 2.063-2.063 1.14 0 2.064 0.925 2.064 2.063 0 1.139-0.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C0.792 0 0 0.774 0 1.729v20.542C0 23.227 0.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                    Connect LinkedIn
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>

        {isEditing && (
            <div className="mt-8 pt-6 border-t border-border-color flex justify-end gap-4">
                <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-text-primary bg-surface rounded-lg border border-border-color hover:bg-surface-accent transition-colors">
                    Cancel
                </button>
                 <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors w-32 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? <SpinnerIcon className="h-5 w-5" /> : 'Save Changes'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Profile;