import React from 'react';
import { XIcon } from './icons/Icons';

interface PrivacyPolicyPageProps {
  onClose: () => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-dark-slate text-gray-300 rounded-2xl shadow-lg w-full max-w-4xl m-4 flex flex-col border border-glass-edge subtle-grid-background" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-glass-edge flex-shrink-0 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
            <XIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto" style={{ maxHeight: '80vh' }}>
          <div className="prose prose-invert prose-p:text-gray-400 prose-headings:text-white">
            <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
            <p>
              Welcome to Socially! Your privacy is critically important to us. This Privacy Policy document outlines the types of personal information that is received and collected by Socially and how it is used.
            </p>
            
            <h3>1. Information We Collect</h3>
            <p>
              When you register for an account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number. When you connect your LinkedIn account, we may collect information necessary to provide our services, such as your profile information and authentication tokens. We do not store your LinkedIn password.
            </p>

            <h3>2. How We Use Your Information</h3>
            <p>
              We use the information we collect in various ways, including to:
            </p>
            <ul>
                <li>Provide, operate, and maintain our website and services</li>
                <li>Improve, personalize, and expand our website and services</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                <li>Process your transactions</li>
                <li>Find and prevent fraud</li>
            </ul>

            <h3>3. Log Files & Cookies</h3>
            <p>
              Socially follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
            </p>
            <p>
              Like any other website, Socially uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information. You can choose to accept or decline cookies through the consent banner provided.
            </p>

            <h3>4. GDPR Data Protection Rights</h3>
            <p>
                We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
            </p>
             <ul>
                <li><strong>The right to access</strong> – You have the right to request copies of your personal data.</li>
                <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
                <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
                <li><strong>The right to data portability</strong> – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
            </ul>

            <h3>Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: privacy@socially.mock.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
