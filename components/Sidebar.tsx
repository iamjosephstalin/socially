import React from 'react';
// FIX: Removed unused ChartBarIcon import
import { HomeIcon, ClockIcon, CalendarIcon, SparklesIcon, UserIcon, PlusIcon } from './icons/Icons';

type View = 'dashboard' | 'history' | 'calendar' | 'automate' | 'profile';

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  onCompose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onCompose }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'history', label: 'History', icon: ClockIcon },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'automate', label: 'Automate', icon: SparklesIcon, isNew: true },
  ];

  const bottomItems = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const NavLink: React.FC<{item: {id: string, label: string, icon: React.FC<any>, isNew?: boolean}, isBottom?: boolean}> = ({ item, isBottom = false }) => {
    const isActive = activeView === item.id;
    return (
        <button
            onClick={() => onNavigate(item.id as View)}
            className={`group w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
            isActive 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
        >            
            <div className={`p-1.5 rounded-md transition-all duration-200 ${
              isActive 
                ? 'bg-white/20' 
                : 'bg-transparent group-hover:bg-gray-100'
            }`}>
              <item.icon className={`h-4 w-4 ${
                isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
              }`} />
            </div>
            
            <span className={`flex-1 text-left ${
              isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'
            }`}>
              {item.label}
            </span>
            
            {item.isNew && (
              <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-full">
                NEW
              </span>
            )}
        </button>
    );
  };
  
  const MobileNavLink: React.FC<{item: {id: View, icon: React.FC<any>}}> = ({ item }) => {
    const isActive = activeView === item.id;
    return (
        <button
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center space-y-1 w-full transition-colors ${
              isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
        >
            <item.icon className="h-6 w-6" />
        </button>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0 p-4 hidden lg:flex">
        {/* Logo */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Socially
              </h1>
              <p className="text-xs text-gray-400 font-medium">AI-Powered</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          {/* Create Post Button */}
          <button 
            onClick={onCompose} 
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg mb-4"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Post</span>
          </button>
          
          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map(item => <NavLink key={item.id} item={item} />)}
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="space-y-1 pt-4 border-t border-gray-200">
          {bottomItems.map(item => <NavLink key={item.id} item={item} isBottom />)}
        </div>
        
        {/* Compact Upgrade Section */}
        <div className="mt-4 p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mx-auto flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800 text-sm">Upgrade to Pro</h3>
              <p className="text-xs text-gray-500 mb-2">Unlock advanced features</p>
            </div>
            <button className="w-full px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border-color shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
        <div className="flex justify-around items-center h-16 px-2">
          <MobileNavLink item={{id: 'dashboard', icon: HomeIcon}} />
          <MobileNavLink item={{id: 'history', icon: ClockIcon}} />
          <button 
            onClick={onCompose} 
            className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg -mt-8 border-4 border-background hover:bg-primary-hover transition-transform active:scale-95"
            aria-label="New Post"
          >
            <PlusIcon className="h-7 w-7" />
          </button>
          <MobileNavLink item={{id: 'calendar', icon: CalendarIcon}} />
          <MobileNavLink item={{id: 'automate', icon: SparklesIcon}} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
