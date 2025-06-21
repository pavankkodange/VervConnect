import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import { useBranding } from '../context/BrandingContext';
import { VervConnectLogo } from './VervConnectLogo';
import { Hotel, Calendar, Bed, Users, UtensilsCrossed, BarChart3, LogOut, Menu, X, Settings, Shield, ZoomIn as Room, MessageSquare, DollarSign, Bell, Building, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentModule: string;
  onModuleChange: (module: string) => void;
}

export function Layout({ children, currentModule, onModuleChange }: LayoutProps) {
  const { user, logout } = useAuth();
  const { unreadCount } = useCommunication();
  const { branding, formatTime, getCurrentTime } = useBranding();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when module changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentModule]);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const getModulesForRole = () => {
    const baseModules = [
      { id: 'dashboard', name: 'Dashboard', icon: BarChart3 }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseModules,
          { id: 'rooms', name: 'Rooms & Bookings', icon: Bed },
          { id: 'housekeeping', name: 'Housekeeping', icon: Calendar },
          { id: 'banquet', name: 'Banquet Halls', icon: Users },
          { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed },
          { id: 'room-service', name: 'Room Service', icon: Room },
          { id: 'communications', name: 'Communications', icon: MessageSquare, badge: unreadCount },
          { id: 'financial', name: 'Financial', icon: DollarSign },
          { id: 'admin', name: 'Administration', icon: Shield }
        ];
      case 'manager':
        return [
          ...baseModules,
          { id: 'rooms', name: 'Rooms & Bookings', icon: Bed },
          { id: 'housekeeping', name: 'Housekeeping', icon: Calendar },
          { id: 'banquet', name: 'Banquet Halls', icon: Users },
          { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed },
          { id: 'room-service', name: 'Room Service', icon: Room },
          { id: 'communications', name: 'Communications', icon: MessageSquare, badge: unreadCount },
          { id: 'financial', name: 'Financial', icon: DollarSign }
        ];
      case 'front-desk':
        return [
          ...baseModules,
          { id: 'rooms', name: 'Rooms & Bookings', icon: Bed },
          { id: 'banquet', name: 'Banquet Halls', icon: Users },
          { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed },
          { id: 'room-service', name: 'Room Service', icon: Room },
          { id: 'communications', name: 'Communications', icon: MessageSquare, badge: unreadCount }
        ];
      case 'housekeeping':
        return [
          ...baseModules,
          { id: 'housekeeping', name: 'Housekeeping', icon: Calendar },
          { id: 'rooms', name: 'Room Status', icon: Bed },
          { id: 'communications', name: 'Communications', icon: MessageSquare, badge: unreadCount }
        ];
      case 'restaurant':
        return [
          ...baseModules,
          { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed },
          { id: 'room-service', name: 'Room Service', icon: Room },
          { id: 'communications', name: 'Communications', icon: MessageSquare, badge: unreadCount }
        ];
      default:
        return baseModules;
    }
  };

  const modules = getModulesForRole();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'front-desk': return 'Front Desk';
      case 'housekeeping': return 'Housekeeping';
      case 'restaurant': return 'Restaurant';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-purple-400 to-purple-500';
      case 'manager': return 'bg-gradient-to-r from-blue-400 to-blue-500';
      case 'front-desk': return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
      case 'housekeeping': return 'bg-gradient-to-r from-orange-400 to-orange-500';
      case 'restaurant': return 'bg-gradient-to-r from-rose-400 to-rose-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const handleModuleChange = (moduleId: string) => {
    onModuleChange(moduleId);
    setSidebarOpen(false); // Always close sidebar when changing modules
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? 'fixed inset-0 z-50' : 'hidden lg:flex'} ${mobile ? 'lg:hidden' : ''}`}>
      {mobile && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
          onClick={closeSidebar}
          onTouchEnd={closeSidebar}
        />
      )}
      
      <div className={`flex flex-col ${mobile ? 'w-80' : 'w-80'} bg-white/95 backdrop-blur-md shadow-2xl border-r border-blue-100 ${mobile ? 'relative' : ''}`}>
        {/* VervConnect Platform Branding */}
        <div className="flex items-center justify-between h-16 lg:h-20 px-3 lg:px-4 border-b border-blue-100 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50">
          <div className="flex items-center space-x-2 w-full min-w-0">
            {/* Home button - positioned to the left */}
            <button
              onClick={() => handleModuleChange('dashboard')}
              className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
            >
              <Home className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            
            {/* Logo and text container with proper spacing */}
            <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
              <VervConnectLogo size={mobile ? "sm" : "md"} animated={true} />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight truncate">
                  VervConnect
                </h1>
                <p className="text-xs lg:text-sm bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent font-medium truncate">
                  Connect with Comfort
                </p>
              </div>
            </div>
          </div>
          
          {mobile && (
            <button 
              onClick={closeSidebar}
              onTouchEnd={closeSidebar}
              className="lg:hidden flex-shrink-0 p-2 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
            >
              <X className="w-5 h-5 text-blue-600" />
            </button>
          )}
        </div>

        {/* Hotel Info Section */}
        <div className="p-3 lg:p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="p-3 lg:p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-200 shadow-sm">
            <div className="flex items-center space-x-3">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={`${branding.hotelName} Logo`}
                  className="h-8 lg:h-10 w-auto rounded-lg shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-500 shadow-sm flex-shrink-0">
                  <Building className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base lg:text-lg font-bold text-gray-800 truncate">{branding.hotelName}</h3>
                {branding.starRating > 0 && (
                  <div className="flex items-center space-x-1 mb-1">
                    {Array.from({ length: branding.starRating }, (_, i) => (
                      <span key={i} className="text-yellow-400 text-xs lg:text-sm">★</span>
                    ))}
                    <span className="text-xs ml-1 text-gray-600 truncate">
                      {branding.starRating} Star Hotel
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-600 truncate">
                  {branding.address.city}, {branding.address.state}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 lg:px-4 py-4 lg:py-6 overflow-y-auto bg-gradient-to-b from-white to-blue-50">
          <nav className="space-y-1 lg:space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = currentModule === module.id;
              
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleChange(module.id)}
                  className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-3 lg:py-3 rounded-xl text-left transition-all relative touch-manipulation ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-r-4 border-blue-500 shadow-md' 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-800 active:bg-blue-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium truncate text-sm lg:text-base">{module.name}</span>
                  {module.badge && module.badge > 0 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-400 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 shadow-sm">
                      {module.badge > 99 ? '99+' : module.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 lg:p-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3 mb-3 lg:mb-4">
            <div className={`w-8 h-8 lg:w-10 lg:h-10 ${getRoleBadgeColor(user?.role || '')} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`}>
              <span className="text-white font-medium text-sm lg:text-base">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate">
                {getRoleDisplayName(user?.role || '')}
              </p>
            </div>
          </div>
          
          {/* Current Time Display */}
          <div className="mb-3 p-2 lg:p-3 rounded-xl bg-gradient-to-r from-sky-100 to-blue-100 border border-sky-200">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span className="text-sm font-medium text-sky-800 truncate">
                {formatTime(getCurrentTime())}
              </span>
            </div>
            <p className="text-xs mt-1 text-sky-600 truncate">
              {branding.timeZone.split('/')[1]?.replace('_', ' ')} Time
            </p>
          </div>
          
          {/* Notification Bell */}
          {unreadCount > 0 && (
            <div className="mb-3 p-2 lg:p-3 rounded-xl bg-gradient-to-r from-red-100 to-rose-100 border border-red-200">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm font-medium text-red-800 truncate">
                  {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => handleModuleChange('communications')}
                className="text-xs mt-1 text-red-600 hover:text-red-800 transition-colors"
              >
                View messages
              </button>
            </div>
          )}
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-2 rounded-xl transition-all text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-800 active:bg-blue-100 touch-manipulation"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm lg:text-base">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {sidebarOpen && <Sidebar mobile />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-blue-100 lg:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center space-x-2">
              {/* Home button - moved to left of logo */}
              <button
                onClick={() => handleModuleChange('dashboard')}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
              >
                <Home className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-blue-600 hover:text-blue-800 flex-shrink-0 p-2 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2 flex-1 justify-center min-w-0">
              <VervConnectLogo size="sm" animated={true} />
              <div className="text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                VervConnect
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={() => handleModuleChange('communications')}
                  className="relative p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-400 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}