import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Award, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle,
  Eye,
  GraduationCap
} from 'lucide-react';

interface TeacherAnalyticsProps {
  onSelectStudent: (student: User) => void;
  onOpenMessageWithStudent: (studentId: string) => void;
}

export const TeacherAnalytics: React.FC<TeacherAnalyticsProps> = ({
  onSelectStudent,
  onOpenMessageWithStudent,
}) => {
  const { currentUser, batches, enrollments, users, attendanceRecords, testScores, feeRecords } = useApp();

  const myBatches = batches.filter((b) => b.teacherId === currentUser?.id);
  const myBatchIds = myBatches.map((b) => b.id);

  // Active enrolled students
  const myEnrollments = enrollments.filter((e) => myBatchIds.includes(e.batchId) && e.status === 'active');
  const studentIds = Array.from(new Set(myEnrollments.map((e) => e.studentId)));
  const myStudents = users.filter((u) => studentIds.includes(u.id));

  // Attendance metrics
  const myAttendance = attendanceRecords.filter((a) => myBatchIds.includes(a.batchId));
  const totalAtt = myAttendance.length;
  const presentAtt = myAttendance.filter((a) => a.status === 'present').length;
  const lateAtt = myAttendance.filter((a) => a.status === 'late').length;
  const overallAttendanceRate = totalAtt > 0 ? Math.round(((presentAtt + lateAtt * 0.5) / totalAtt) * 100) : 100;

  // Test metrics
  const myTests = testScores.filter((t) => myBatchIds.includes(t.batchId));
  const avgTestScore = myTests.length > 0
    ? Math.round(myTests.reduce((acc, t) => acc + (t.marksObtained / t.maxMarks) * 100, 0) / myTests.length)
    : 0;

  // Fee collection metrics
  const myFees = feeRecords.filter((f) => myBatchIds.includes(f.batchId));
  const paidFeesCount = myFees.filter((f) => f.status === 'paid').length;
  const feeCollectionRate = myFees.length > 0 ? Math.round((paidFeesCount / myFees.length) * 100) : 100;

  // Per-student summary for Top Performers and At-Risk list
  const studentMetrics = myStudents.map((student) => {
    const sAtt = myAttendance.filter((a) => a.studentId === student.id);
    const sRate = sAtt.length > 0
      ? Math.round((sAtt.filter((a) => a.status === 'present').length / sAtt.length) * 100)
      : 100;

    const sTests = myTests.filter((t) => t.studentId === student.id);
    const sAvg = sTests.length > 0
      ? Math.round(sTests.reduce((acc, t) => acc + (t.marksObtained / t.maxMarks) * 100, 0) / sTests.length)
      : null;

    return {
      student,
      attendanceRate: sRate,
      averageScore: sAvg,
      testCount: sTests.length,
    };
  });

  // Top performers (Avg >= 80)
  const topPerformers = [...studentMetrics]
    .filter((m) => m.averageScore !== null && m.averageScore >= 80)
    .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));

  // At-risk students (attendance < 75% OR test average < 70%)
  const atRiskStudents = [...studentMetrics].filter(
    (m) => m.attendanceRate < 75 || (m.averageScore !== null && m.averageScore < 70)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Instructor Analytics & Performance Insights
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor batch attendance averages, exam performance curves, and identify at-risk students who need personal mentoring.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Students</p>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{myStudents.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across {myBatches.length} coaching batches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Attendance</p>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{overallAttendanceRate}%</p>
          <p className="text-[11px] text-slate-400 mt-1">{presentAtt} present of {totalAtt} recorded sessions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Batch Exam Average</p>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 mt-2">{avgTestScore}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Based on {myTests.length} evaluations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fee Collection Rate</p>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{feeCollectionRate}%</p>
          <p className="text-[11px] text-slate-400 mt-1">{paidFeesCount} of {myFees.length} invoices cleared</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch-by-Batch Attendance & Performance Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Batch-Wise Performance Comparison
          </h3>

          <div className="space-y-4">
            {myBatches.map((batch) => {
              const bEnr = enrollments.filter((e) => e.batchId === batch.id && e.status === 'active').length;
              const bAtt = myAttendance.filter((a) => a.batchId === batch.id);
              const bRate = bAtt.length > 0
                ? Math.round((bAtt.filter((a) => a.status === 'present').length / bAtt.length) * 100)
                : 90;

              const bTests = myTests.filter((t) => t.batchId === batch.id);
              const bAvg = bTests.length > 0
                ? Math.round(bTests.reduce((acc, t) => acc + (t.marksObtained / t.maxMarks) * 100, 0) / bTests.length)
                : 82;

              return (
                <div key={batch.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-100">
                        {batch.code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{batch.name}</h4>
                    </div>
                    <span className="text-xs font-bold text-slate-600">{bEnr} Students</span>
                  </div>

                  {/* Attendance Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Attendance Consistency</span>
                      <span className="font-bold text-slate-800">{bRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${bRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Test Avg Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Test Score Mastery</span>
                      <span className="font-bold text-slate-800">{bAvg}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${bAvg}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attention Needed / At Risk Students Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Action Required: At-Risk Students ({atRiskStudents.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Attendance &lt; 75% or Scores &lt; 70%</span>
          </div>

          {atRiskStudents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">All students meeting benchmark performance!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No students currently flagged as at-risk.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {atRiskStudents.map(({ student, attendanceRate, averageScore }) => (
                <div
                  key={student.id}
                  className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                      alt={student.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-rose-200 shrink-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{student.name}</p>
                      <p className="text-[11px] text-slate-500">{student.grade || 'Class 10'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${attendanceRate < 75 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                          Att: {attendanceRate}%
                        </span>
                        {averageScore !== null && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${averageScore < 70 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                            Score: {averageScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenMessageWithStudent(student.id)}
                      className="p-1.5 bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                      title="Send Personal Guidance Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectStudent(student)}
                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Star Students */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Top Star Students of the Month 🌟
            </h4>
            <div className="flex flex-wrap gap-2">
              {topPerformers.slice(0, 4).map(({ student, averageScore }) => (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50/70 border border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-100/70 transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-950">{student.name}</span>
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-white px-1.5 py-0.2 rounded border border-indigo-100">
                    {averageScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
