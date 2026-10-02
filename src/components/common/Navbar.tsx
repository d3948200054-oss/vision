import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  LogOut, 
  ShieldCheck, 
  Settings, 
  Download, 
  User,
  ArrowRight
} from 'lucide-react';

import { AppLogo } from './AppLogo';
import { InstallAppModal } from './InstallAppModal';

interface NavbarProps {
  onOpenAuth: (role?: 'teacher' | 'student') => void;
  onOpenOmshankarProfile: () => void;
  onOpenAdminPanel: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAuth, 
  onOpenOmshankarProfile, 
  onOpenAdminPanel, 
  activeTab, 
  setActiveTab 
}) => {
  const { 
    currentUser, 
    logout, 
    notifications, 
    markNotificationAsRead 
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }
  }, []);

  const userNotifications = notifications.filter((n) => !currentUser || n.userId === currentUser.id);
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Institute Brand */}
            <div className="flex items-center gap-3">
              <AppLogo size="md" />
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Vision Portal
              </span>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {/* Install App Button */}
              {!isStandalone && (
                <button
                  onClick={() => setShowInstallModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all text-xs font-bold shadow-2xs active:scale-95 group"
                  title="Install Vision Classes Application"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                  <span className="hidden sm:inline">Install App</span>
                </button>
              )}

              {/* Omshankar Profile Badge */}
              <button
                onClick={onOpenOmshankarProfile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-950 transition-all text-xs font-black shadow-2xs active:scale-95 group"
                title="View Omshankar Official Profile"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold tracking-tight">Omshankar</span>
                <span className="text-[9px] uppercase tracking-wider bg-amber-200/90 text-amber-950 px-1.5 py-0.5 rounded font-black hidden lg:inline">
                  Founder
                </span>
              </button>

              {/* Direct Admin Control Center Button */}
              <button
                onClick={onOpenAdminPanel}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all text-xs font-bold flex items-center gap-1 active:scale-95"
                title="Open Admin Access Panel"
              >
                <Settings className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden xl:inline">Admin</span>
              </button>

              {/* Notifications Dropdown (When Logged In) */}
              {currentUser && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
                    title="Notifications"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-fadeIn">
                      <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Notifications ({unreadCount} new)
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">Alerts</span>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {userNotifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          userNotifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationAsRead(n.id);
                                if (n.linkTab) setActiveTab(n.linkTab);
                                setShowNotifications(false);
                              }}
                              className={`p-3 text-xs cursor-pointer transition-colors ${
                                n.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/60 hover:bg-blue-50 font-medium'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-bold text-slate-900">{n.title}</p>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-600 mt-1">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile / Auth Action */}
              {currentUser ? (
                <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                  <img
                    src={currentUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-600/30"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-black text-slate-900 leading-none">{currentUser.name}</p>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      currentUser.role === 'teacher' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95 ml-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAuth('teacher')}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all active:scale-95"
                  >
                    Teacher Portal
                  </button>
                  <button
                    onClick={() => onOpenAuth('student')}
                    className="px-4 py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    Student Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PWA Install Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </>
  );
};
