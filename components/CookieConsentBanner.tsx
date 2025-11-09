import React from 'react';

interface CookieConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  onPrivacyClick: () => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onAccept, onDecline, onPrivacyClick }) => {
  return (
    <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-4 rounded-lg bg-glass-surface border border-glass-edge backdrop-blur-md shadow-lg sm:flex sm:items-center sm:justify-between">
          <p className="flex-1 text-sm text-gray-300">
            We use cookies to enhance your experience. By clicking "Accept", you agree to our use of cookies.
            <button onClick={onPrivacyClick} className="ml-2 font-semibold text-white hover:underline">
              Learn more in our Privacy Policy.
            </button>
          </p>
          <div className="mt-4 flex-shrink-0 flex items-center gap-x-4 sm:mt-0 sm:ml-6">
            <button
              type="button"
              onClick={onDecline}
              className="px-4 py-2 text-sm font-semibold text-white rounded-md hover:bg-white/10 transition-colors"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
