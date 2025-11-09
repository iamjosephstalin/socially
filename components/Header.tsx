import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { BellIcon, ChevronDownIcon, UserIcon, LogoutIcon } from './icons/Icons';

interface HeaderProps {
  user: User;
  onProfileClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onProfileClick, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-sm border-b border-gray-200 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 shadow-sm sticky top-0 z-30">
      {/* Welcome Section */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:block">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-xs text-gray-500">
            Ready to create amazing content today?
          </p>
        </div>
        <div className="sm:hidden">
          <h2 className="text-lg font-semibold text-gray-800">
            Hi, {user.name.split(' ')[0]}!
          </h2>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
          <BellIcon className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">3</span>
          </span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="flex items-center space-x-2 p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
          >
            <div className="relative">
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="h-8 w-8 rounded-lg object-cover" 
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border border-white"></div>
            </div>
            <div className="hidden md:block text-left">
              <p className="font-medium text-sm text-gray-800">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">
                Content Creator
              </p>
            </div>
            <ChevronDownIcon className={`hidden md:block h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-40">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="h-8 w-8 rounded-lg object-cover" 
                  />
                  <div>
                    <p className="font-medium text-sm text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="py-1">
                <button 
                  onClick={() => { onProfileClick(); setIsDropdownOpen(false); }} 
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center transition-colors duration-200"
                >
                  <UserIcon className="h-4 w-4 mr-2"/> 
                  <span>View Profile</span>
                </button>
                <button 
                  onClick={onLogout} 
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center transition-colors duration-200"
                >
                  <LogoutIcon className="h-4 w-4 mr-2"/> 
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;