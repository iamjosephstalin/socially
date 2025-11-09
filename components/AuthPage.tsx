import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import CookieConsentBanner from './CookieConsentBanner';

interface AuthPageProps {
  onLoginSuccess: () => Promise<void>;
  onSignupSuccess: (userData: { name: string; email: string; password: string }) => Promise<void>;
}

type AuthView = 'landing' | 'login' | 'signup';

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onSignupSuccess }) => {
  const [view, setView] = useState<AuthView>('landing');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<'accepted' | 'declined' | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'accepted' || consent === 'declined') {
        setCookieConsent(consent);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setCookieConsent('accepted');
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setCookieConsent('declined');
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return <LoginPage onSignupClick={() => setView('signup')} onLoginSuccess={onLoginSuccess} />;
      case 'signup':
        return <SignupPage onLoginClick={() => setView('login')} onSignupSuccess={onSignupSuccess} />;
      case 'landing':
      default:
        return (
          <LandingPage
            onLoginClick={() => setView('login')}
            onSignupClick={() => setView('signup')}
            onPrivacyClick={() => setShowPrivacy(true)}
          />
        );
    }
  };

  return (
    <div>
      {renderView()}
      {showPrivacy && <PrivacyPolicyPage onClose={() => setShowPrivacy(false)} />}
      {!cookieConsent && (
          <CookieConsentBanner 
            onAccept={handleAcceptCookies}
            onDecline={handleDeclineCookies}
            onPrivacyClick={() => setShowPrivacy(true)}
          />
      )}
    </div>
  );
};

export default AuthPage;