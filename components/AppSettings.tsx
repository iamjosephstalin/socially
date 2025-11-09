import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './icons/Icons';

interface AppSettingsProps {
  onClose?: () => void;
}

const AppSettings: React.FC<AppSettingsProps> = ({ onClose }) => {
  const [linkedinClientId, setLinkedinClientId] = useState('');
  const [linkedinClientSecret, setLinkedinClientSecret] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load existing settings from localStorage or backend
    const savedClientId = localStorage.getItem('linkedin_client_id') || '';
    const savedClientSecret = localStorage.getItem('linkedin_client_secret') || '';
    setLinkedinClientId(savedClientId);
    setLinkedinClientSecret(savedClientSecret);
  }, []);

  const handleSave = async () => {
    if (!linkedinClientId.trim()) {
      setMessage({ type: 'error', text: 'LinkedIn Client ID is required' });
      return;
    }

    if (!linkedinClientSecret.trim()) {
      setMessage({ type: 'error', text: 'LinkedIn Client Secret is required' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Save to localStorage (in production, this should go to backend/secure storage)
      localStorage.setItem('linkedin_client_id', linkedinClientId);
      localStorage.setItem('linkedin_client_secret', linkedinClientSecret);

      // In a real app, you'd send this to backend to update .env or config file
      // For now, we'll just show a message that they need to update .env manually
      setMessage({ 
        type: 'success', 
        text: 'Settings saved to local storage. To make them permanent, update your backend .env file with these values.' 
      });
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">App Settings</h2>
          <p className="text-text-secondary mt-2">Configure application-level settings and API credentials</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-text-primary bg-surface rounded-lg border border-border-color hover:bg-surface-accent transition-colors"
          >
            Close
          </button>
        )}
      </div>

      <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-subtle">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-text-primary mb-2">LinkedIn API Configuration</h3>
          <p className="text-sm text-text-secondary mb-4">
            Configure your LinkedIn API credentials to enable posting and automation features. 
            Get your credentials from{' '}
            <a 
              href="https://www.linkedin.com/developers/apps" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              LinkedIn Developers
            </a>.
          </p>
          <div className="bg-primary-accent border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-text-secondary">
              <strong className="text-text-primary">Note:</strong> These credentials are stored locally in your browser. 
              For production use, you should update the <code className="bg-surface px-1 py-0.5 rounded">LINKEDIN_CLIENT_ID</code> and{' '}
              <code className="bg-surface px-1 py-0.5 rounded">LINKEDIN_CLIENT_SECRET</code> in your backend{' '}
              <code className="bg-surface px-1 py-0.5 rounded">.env</code> file.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              LinkedIn Client ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={linkedinClientId}
              onChange={(e) => setLinkedinClientId(e.target.value)}
              placeholder="Enter your LinkedIn Client ID"
              className="w-full bg-surface-accent border border-border-color rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none text-text-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              LinkedIn Client Secret <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={linkedinClientSecret}
              onChange={(e) => setLinkedinClientSecret(e.target.value)}
              placeholder="Enter your LinkedIn Client Secret"
              className="w-full bg-surface-accent border border-border-color rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none text-text-primary font-mono text-sm"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-border-color">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <SpinnerIcon className="h-4 w-4" />}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;

