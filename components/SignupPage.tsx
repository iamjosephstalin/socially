import React, { useState } from 'react';
import { SpinnerIcon } from './icons/Icons';

interface SignupPageProps {
  onLoginClick: () => void;
  onSignupSuccess: (userData: { name: string; email: string; password: string }) => Promise<void>;
}

const SignupPage: React.FC<SignupPageProps> = ({ onLoginClick, onSignupSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    setIsLoading(true);
    try {
      await onSignupSuccess({ name, email, password });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-slate flex items-center justify-center p-4 subtle-grid-background">
      <div className="w-full max-w-md">
        <div className="bg-glass-surface border border-glass-edge rounded-2xl p-8 backdrop-blur-lg shadow-2xl text-gray-200">
          <h2 className="text-3xl font-bold text-center text-white mb-2">Create Your Account</h2>
          <p className="text-center text-gray-400 mb-8">Start your journey to effortless content.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Alex Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-400">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <SpinnerIcon className="h-6 w-6" /> : 'Sign Up'}
              </button>
            </div>
          </form>
          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button onClick={onLoginClick} className="font-semibold text-primary hover:underline">
              Log in
            </button>
          </p>
        </div>
      </div>
       <style>{`
            .subtle-grid-background {
                background-image:
                    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                background-size: 40px 40px;
                background-position: center;
            }
        `}</style>
    </div>
  );
};

export default SignupPage;