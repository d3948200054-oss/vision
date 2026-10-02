import React from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicPerformanceChart } from './AcademicPerformanceChart';
import { 
  Award, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  BookOpen,
  MessageSquare
} from 'lucide-react';

interface StudentPerformanceViewProps {
  onOpenMessages: () => void;
}

export const StudentPerformanceView: React.FC<StudentPerformanceViewProps> = ({ onOpenMessages }) => {
  const { currentUser, batches, enrollments, attendanceRecords, testScores, homeworkSubmissions } = useApp();

  if (!currentUser) return null;

  // Student's active enrolled batch IDs
  const myEnrollments = enrollments.filter((e) => e.studentId === currentUser.id && e.status === 'active');
  const myBatchIds = myEnrollments.map((e) => e.batchId);
  const myBatches = batches.filter((b) => myBatchIds.includes(b.id));

  // Student's attendance records
  const myAttendance = attendanceRecords.filter((a) => a.studentId === currentUser.id);
  const totalAtt = myAttendance.length;
  const presentAtt = myAttendance.filter((a) => a.status === 'present').length;
  const lateAtt = myAttendance.filter((a) => a.status === 'late').length;
  const attendanceRate = totalAtt > 0 ? Math.round(((presentAtt + lateAtt * 0.5) / totalAtt) * 100) : 100;

  // Student's test scores
  const myTests = testScores.filter((t) => t.studentId === currentUser.id);
  const averageScore = myTests.length > 0
    ? Math.round(myTests.reduce((acc, t) => acc + (t.marksObtained / t.maxMarks) * 100, 0) / myTests.length)
    : null;

  // Student's homework submissions
  const mySubmissions = homeworkSubmissions.filter((s) => s.studentId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Top Banner / Student Greeting */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 rounded-3xl shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/10 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">{currentUser.name}&apos;s Academic Record</h2>
                <span className="text-xs bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-full font-bold">
                  {currentUser.grade || 'Class 10'}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                Student ID: <span className="font-mono font-bold">{currentUser.studentId || 'ST-2026-01'}</span> · Vision Classes
              </p>
            </div>
          </div>

          <button
            onClick={onOpenMessages}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shrink-0 shadow-sm active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            Ask Instructor a Doubt
          </button>
        </div>

        {/* Highlight Scorecards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Attendance Rate</p>
            <p className={`text-2xl font-black mt-0.5 ${attendanceRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {attendanceRate}%
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{presentAtt} of {totalAtt} days present</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Overall Test Average</p>
            <p className="text-2xl font-black text-blue-300 mt-0.5">
              {averageScore !== null ? `${averageScore}%` : '88%*'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{myTests.length} tests evaluated</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Homework Completed</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">{mySubmissions.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Turned in assignments</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Enrolled Classes</p>
            <p className="text-2xl font-black text-white mt-0.5">{myBatches.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Active batches</p>
          </div>
        </div>
      </div>

      {/* Integrated Academic Performance Trends Component using Recharts */}
      <AcademicPerformanceChart />

      {/* Test Scores History */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Assessment & Test Marks History</h3>
            <p className="text-xs text-slate-500">Unit tests, weekly quizzes, and term examination grades</p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
            {myTests.length} Tests Evaluated
          </span>
        </div>

        {myTests.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            No live test scores logged yet. Your instructor publishes test grades here directly from their portal.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {myTests.map((t) => {
              const pct = Math.round((t.marksObtained / t.maxMarks) * 100);

              return (
                <div key={t.id} className="p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {t.subject}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{t.testName}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Conducted on: {t.date}</p>
                    {t.feedback && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2 italic">
                        Teacher Feedback: &quot;{t.feedback}&quot;
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-slate-900">
                      {t.marksObtained} <span className="text-xs font-normal text-slate-400">/ {t.maxMarks}</span>
                    </p>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      pct >= 80 ? 'text-emerald-700 bg-emerald-50' : pct >= 60 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                    }`}>
                      {pct}% ({t.gradeLetter || 'B'})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Recent Attendance Records</h3>
            <p className="text-xs text-slate-500">Official log maintained by your teachers</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
            attendanceRate >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            Overall Consistency: {attendanceRate}%
          </span>
        </div>

        {myAttendance.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            No attendance entries logged yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {myAttendance.slice(0, 9).map((att) => {
              const batch = batches.find((b) => b.id === att.batchId);

              return (
                <div key={att.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{att.date}</p>
                    <p className="text-[11px] text-slate-500">{batch?.name || 'Class'}</p>
                    {att.remarks && <p className="text-[10px] text-slate-400 italic mt-0.5">{att.remarks}</p>}
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    att.status === 'present'
                      ? 'bg-emerald-100 text-emerald-800'
                      : att.status === 'late'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {att.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
