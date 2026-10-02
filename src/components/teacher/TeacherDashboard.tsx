import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { BatchManager } from './BatchManager';
import { ApprovalRequests } from './ApprovalRequests';
import { StudentRoster } from './StudentRoster';
import { IndividualStudentDetailModal } from './IndividualStudentDetailModal';
import { AttendanceTracker } from './AttendanceTracker';
import { HomeworkTracker } from './HomeworkTracker';
import { StudyMaterialsManager } from './StudyMaterialsManager';
import { FeeManager } from './FeeManager';
import { TeacherAnalytics } from './TeacherAnalytics';
import { MessagingCenter } from './MessagingCenter';
import { BatchTimetable } from '../common/BatchTimetable';
import { 
  LayoutDashboard, 
  BookOpen, 
  UserCheck, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  BarChart3, 
  MessageSquare, 
  ShieldCheck, 
  Clock,
  Sparkles,
  QrCode,
  Image as ImageIcon
} from 'lucide-react';

interface TeacherDashboardProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const { currentUser, batches, joinRequests, feeRecords } = useApp();

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<User | null>(null);
  const [messagingTargetStudentId, setMessagingTargetStudentId] = useState<string | null>(null);
  const [contextBatchId, setContextBatchId] = useState<string | undefined>(undefined);

  // Pending join requests count for badge
  const pendingRequestsCount = joinRequests.filter(
    (r) => r.teacherId === currentUser?.id && r.status === 'pending'
  ).length;

  // Pending fee screenshots count
  const pendingScreenshotsCount = feeRecords.filter(
    (f) => f.teacherId === currentUser?.id && f.status === 'verification_pending'
  ).length;

  const handleSelectStudentForDetail = (student: User) => {
    setSelectedStudentForDetail(student);
  };

  const handleOpenMessageWithStudent = (studentId: string) => {
    setMessagingTargetStudentId(studentId);
    setCurrentTab('messages');
  };

  const handleBatchSelectedForAttendance = (batchId: string) => {
    setContextBatchId(batchId);
    setCurrentTab('attendance');
  };

  const handleBatchSelectedForHomework = (batchId: string) => {
    setContextBatchId(batchId);
    setCurrentTab('homework');
  };

  const navItems = [
    { id: 'batches', label: 'Batches & Classes', icon: BookOpen },
    { id: 'timetable', label: 'Batch Timetable', icon: Clock },
    { 
      id: 'approvals', 
      label: 'Admissions', 
      icon: UserCheck, 
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined 
    },
    { id: 'roster', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'homework', label: 'Homework', icon: FileText },
    { id: 'materials', label: 'Study Materials', icon: BookOpen },
    { 
      id: 'fees', 
      label: 'Fees & Screenshots', 
      icon: DollarSign,
      badge: pendingScreenshotsCount > 0 ? pendingScreenshotsCount : undefined
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'messages', label: '1-on-1 Chat', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* App Segmented Navigation Bar for Teacher Portal */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm p-1.5 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white text-blue-900'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab View Switching */}
      <div className="transition-all animate-fadeIn">
        {currentTab === 'batches' && (
          <BatchManager
            onSelectBatchForAttendance={handleBatchSelectedForAttendance}
            onSelectBatchForHomework={handleBatchSelectedForHomework}
          />
        )}

        {currentTab === 'timetable' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Weekly Class Timetable & Schedule
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                View your complete schedule across all assigned batches. Days and slot timings reflect active teaching sessions.
              </p>
            </div>
            <BatchTimetable mode="teacher" />
          </div>
        )}

        {currentTab === 'approvals' && <ApprovalRequests />}

        {currentTab === 'roster' && (
          <StudentRoster
            onSelectStudent={handleSelectStudentForDetail}
            onDirectMessage={handleOpenMessageWithStudent}
          />
        )}

        {currentTab === 'attendance' && (
          <AttendanceTracker initialBatchId={contextBatchId} />
        )}

        {currentTab === 'homework' && (
          <HomeworkTracker initialBatchId={contextBatchId} />
        )}

        {currentTab === 'materials' && <StudyMaterialsManager />}

        {currentTab === 'fees' && <FeeManager />}

        {currentTab === 'analytics' && (
          <TeacherAnalytics
            onSelectStudent={handleSelectStudentForDetail}
            onOpenMessageWithStudent={handleOpenMessageWithStudent}
          />
        )}

        {currentTab === 'messages' && (
          <MessagingCenter
            initialRecipientId={messagingTargetStudentId}
            onSelectStudentDetail={handleSelectStudentForDetail}
          />
        )}
      </div>

      {/* Individual Student Detail Modal */}
      {selectedStudentForDetail && (
        <IndividualStudentDetailModal
          student={selectedStudentForDetail}
          onClose={() => setSelectedStudentForDetail(null)}
          onOpenMessageWithStudent={(studentId: string) => {
            setSelectedStudentForDetail(null);
            handleOpenMessageWithStudent(studentId);
          }}
        />
      )}
    </div>
  );
};
