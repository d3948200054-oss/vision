import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  Calendar, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  Home, 
  Award, 
  UserCheck, 
  Sparkles,
  QrCode
} from 'lucide-react';

interface MobileAppBottomBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const MobileAppBottomBar: React.FC<MobileAppBottomBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
}) => {
  const { currentUser, feeRecords, homeworks, joinRequests } = useApp();

  if (!currentUser) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-2xl px-4 py-2 flex items-center justify-between pb-safe">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            V
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 leading-tight">Vision App</p>
            <p className="text-[10px] text-slate-500">Coaching & Fees</p>
          </div>
        </div>
        <button
          onClick={onOpenAuth}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          Sign In / Portal
        </button>
      </div>
    );
  }

  // Teacher navigation items
  if (currentUser.role === 'teacher') {
    const pendingScreenshots = feeRecords.filter(
      (f) => f.teacherId === currentUser.id && f.status === 'verification_pending'
    ).length;

    const pendingRequests = joinRequests.filter(
      (r) => r.teacherId === currentUser.id && r.status === 'pending'
    ).length;

    const teacherItems = [
      { id: 'batches', label: 'Batches', icon: BookOpen },
      { id: 'attendance', label: 'Attendance', icon: Calendar },
      { id: 'fees', label: 'Fees', icon: DollarSign, badge: pendingScreenshots > 0 ? pendingScreenshots : undefined },
      { id: 'homework', label: 'Homework', icon: FileText },
      { id: 'messages', label: 'Chat', icon: MessageSquare },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl px-2 py-1.5 flex items-center justify-around pb-safe">
        {teacherItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all active:scale-90 ${
                isActive
                  ? 'text-blue-700 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5 animate-fadeIn" />
              )}
            </button>
          );
        })}
      </nav>
    );
  }

  // Student navigation items
  const myPendingFees = feeRecords.filter(
    (f) => f.studentId === currentUser.id && (f.status === 'pending' || f.status === 'overdue')
  ).length;

  const studentItems = [
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'materials', label: 'Study', icon: Sparkles },
    { id: 'fees', label: 'Fees & QR', icon: QrCode, badge: myPendingFees > 0 ? myPendingFees : undefined },
    { id: 'homework', label: 'Homework', icon: FileText },
    { id: 'messages', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl px-2 py-1.5 flex items-center justify-around pb-safe">
      {studentItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.id === 'classes' && activeTab === 'batches');

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all active:scale-90 ${
              isActive
                ? 'text-blue-700 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5 animate-fadeIn" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
