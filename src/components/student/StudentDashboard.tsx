import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentPerformanceView } from './StudentPerformanceView';
import { StudentHomeworkView } from './StudentHomeworkView';
import { StudentMaterialsView } from './StudentMaterialsView';
import { StudentFeePaymentView } from './StudentFeePaymentView';
import { StudentMessagingView } from './StudentMessagingView';
import { JoinClassModal } from './JoinClassModal';
import { BatchTimetable } from '../common/BatchTimetable';
import { 
  BookOpen, 
  Award, 
  FileText, 
  DollarSign, 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  Calendar,
  Users,
  QrCode,
  Sparkles
} from 'lucide-react';

interface StudentDashboardProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const { currentUser, batches, enrollments, joinRequests, feeRecords, homeworks } = useApp();
  const [showJoinModal, setShowJoinModal] = useState(false);

  if (!currentUser) return null;

  // Active enrollments
  const myEnrollments = enrollments.filter((e) => e.studentId === currentUser.id && e.status === 'active');
  const myBatchIds = myEnrollments.map((e) => e.batchId);
  const myBatches = batches.filter((b) => myBatchIds.includes(b.id));

  // Pending join requests
  const myPendingRequests = joinRequests.filter(
    (r) => r.studentId === currentUser.id && r.status === 'pending'
  );

  // Unpaid fee count for badge
  const pendingFeesCount = feeRecords.filter(
    (f) => f.studentId === currentUser.id && (f.status === 'pending' || f.status === 'overdue' || f.status === 'verification_pending')
  ).length;

  // Active homework assignments
  const activeHomeworkCount = homeworks.filter((h) => myBatchIds.includes(h.batchId)).length;

  const navItems = [
    { id: 'classes', label: 'My Classes', icon: BookOpen },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock },
    { id: 'performance', label: 'Performance', icon: Award },
    { id: 'homework', label: 'Homework', icon: FileText, badge: activeHomeworkCount > 0 ? activeHomeworkCount : undefined },
    { id: 'materials', label: 'Study Materials', icon: Sparkles },
    { id: 'fees', label: 'Tuition & QR Pay', icon: QrCode, badge: pendingFeesCount > 0 ? pendingFeesCount : undefined },
    { id: 'messages', label: 'Messages & Notices', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Student Learning Center
            </h2>
            <span className="text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 px-3 py-0.5 rounded-full">
              {currentUser.grade || 'Class 10'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Access your enrolled batches, study guides, homework tracking, and submit fee payment screenshots to your teacher.
          </p>
        </div>

        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Join Class with Code
        </button>
      </div>

      {/* Pending Join Request Alerts (Waiting for Teacher Approval) */}
      {myPendingRequests.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Admission Request Pending Instructor Review</span>
          </div>
          <div className="space-y-1">
            {myPendingRequests.map((req) => (
              <div key={req.id} className="text-xs text-amber-800 bg-white/80 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                <span>Requested admission into <strong>{req.batchName}</strong> (Code: {req.batchCode})</span>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Awaiting Faculty Approval
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* App Segmented Navigation Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm p-1.5 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'classes' && currentTab === 'batches');

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
                        : 'bg-amber-500 text-white'
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
        {(currentTab === 'classes' || currentTab === 'batches') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBatches.length === 0 ? (
                <div className="col-span-full bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-400">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  You are not yet enrolled in any classes. Click &quot;Join Class with Code&quot; above to request admission!
                </div>
              ) : (
                myBatches.map((batch) => (
                  <div key={batch.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                          {batch.grade}
                        </span>
                        {batch.joiningMonth && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-600" />
                            Joined: {batch.joiningMonth}
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold text-slate-400">{batch.code}</span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-2">{batch.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Subjects: <strong className="text-slate-700">{batch.subjectsList?.join(' · ') || batch.subject}</strong>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{batch.schedule}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Instructor: <strong className="text-slate-800">{batch.teacherName}</strong></span>
                      <button
                        onClick={() => setCurrentTab('materials')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Study Guides →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Performance & Trend Teaser Card */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white shadow-sm border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    <Award className="w-4 h-4 text-blue-300" />
                  </span>
                  <h4 className="text-sm font-black text-white tracking-tight">Academic Performance & Quiz Analytics</h4>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    Recharts Powered
                  </span>
                </div>
                <p className="text-xs text-blue-200/90 max-w-xl">
                  Track your evaluation marks, score progression curves over time, assignment completion rates, and subject-wise mastery.
                </p>
              </div>

              <button
                onClick={() => setCurrentTab('performance')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 shrink-0 flex items-center gap-2"
              >
                <span>View Full Performance Charts</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {currentTab === 'timetable' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Your Weekly Class Schedule
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Synchronized timetable for your enrolled classes.
              </p>
            </div>
            <BatchTimetable mode="student" />
          </div>
        )}

        {currentTab === 'performance' && (
          <StudentPerformanceView onOpenMessages={() => setCurrentTab('messages')} />
        )}

        {currentTab === 'homework' && <StudentHomeworkView />}

        {currentTab === 'materials' && <StudentMaterialsView />}

        {currentTab === 'fees' && <StudentFeePaymentView />}

        {currentTab === 'messages' && <StudentMessagingView />}
      </div>

      {/* Join Class with Code Modal */}
      <JoinClassModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
};
