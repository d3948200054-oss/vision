import React, { useState } from 'react';
import { User, Batch } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  UserCheck, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  DollarSign, 
  Send, 
  Plus, 
  Award,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';

interface IndividualStudentDetailModalProps {
  student: User;
  onClose: () => void;
  onOpenMessageWithStudent: (studentId: string) => void;
}

export const IndividualStudentDetailModal: React.FC<IndividualStudentDetailModalProps> = ({
  student,
  onClose,
  onOpenMessageWithStudent,
}) => {
  const {
    currentUser,
    batches,
    enrollments,
    attendanceRecords,
    testScores,
    homeworkSubmissions,
    homeworks,
    feeRecords,
    addTestScore,
    setFeeDueDate,
    sendFeeReminder,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'attendance' | 'homework' | 'fees'>('overview');
  const [showAddTest, setShowAddTest] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newTestSubject, setNewTestSubject] = useState('Mathematics');
  const [newTestMarks, setNewTestMarks] = useState('45');
  const [newTestMaxMarks, setNewTestMaxMarks] = useState('50');
  const [newTestFeedback, setNewTestFeedback] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Filter student data strictly for batches taught by CURRENT TEACHER
  const teacherBatchIds = batches.filter((b) => b.teacherId === currentUser?.id).map((b) => b.id);
  
  const studentEnrollments = enrollments.filter(
    (e) => e.studentId === student.id && teacherBatchIds.includes(e.batchId) && e.status === 'active'
  );

  const studentBatches = batches.filter((b) => studentEnrollments.some((e) => e.batchId === b.id));

  const studentAttendance = attendanceRecords.filter(
    (a) => a.studentId === student.id && teacherBatchIds.includes(a.batchId)
  );

  const studentTests = testScores.filter(
    (t) => t.studentId === student.id && teacherBatchIds.includes(t.batchId)
  );

  const studentSubmissions = homeworkSubmissions.filter(
    (s) => s.studentId === student.id && teacherBatchIds.includes(s.batchId)
  );

  const studentFees = feeRecords.filter(
    (f) => f.studentId === student.id && teacherBatchIds.includes(f.batchId)
  );

  // Compute metrics
  const totalAttendanceDays = studentAttendance.length;
  const presentDays = studentAttendance.filter((a) => a.status === 'present').length;
  const lateDays = studentAttendance.filter((a) => a.status === 'late').length;
  const attendanceRate = totalAttendanceDays > 0 ? Math.round(((presentDays + lateDays * 0.5) / totalAttendanceDays) * 100) : 100;

  const averageTestPercent = studentTests.length > 0
    ? Math.round(
        studentTests.reduce((acc, t) => acc + (t.marksObtained / t.maxMarks) * 100, 0) / studentTests.length
      )
    : null;

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentBatches[0]) return;

    const marks = parseFloat(newTestMarks);
    const max = parseFloat(newTestMaxMarks);
    let gradeLetter = 'B';
    const pct = (marks / max) * 100;
    if (pct >= 90) gradeLetter = 'A+';
    else if (pct >= 80) gradeLetter = 'A';
    else if (pct >= 70) gradeLetter = 'B+';
    else if (pct >= 60) gradeLetter = 'B';
    else if (pct >= 50) gradeLetter = 'C';
    else gradeLetter = 'D';

    addTestScore({
      studentId: student.id,
      batchId: studentBatches[0].id,
      testName: newTestName,
      subject: newTestSubject,
      marksObtained: marks,
      maxMarks: max,
      date: new Date().toISOString().split('T')[0],
      gradeLetter,
      feedback: newTestFeedback,
    });

    setFeedbackSuccess('Test score added to student report card!');
    setTimeout(() => {
      setFeedbackSuccess(null);
      setShowAddTest(false);
      setNewTestName('');
      setNewTestFeedback('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header / Student Profile Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                alt={student.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/10 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{student.name}</h3>
                  <span className="text-xs bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded font-semibold">
                    {student.grade || 'Grade 10'}
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    ID: {student.studentId || 'ST-2026'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {student.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {student.phone || 'No phone'}
                  </span>
                  {student.parentName && (
                    <span className="text-slate-400">
                      Parent: <strong className="text-white">{student.parentName}</strong> ({student.parentPhone})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenMessageWithStudent(student.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Direct Message Student
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl p-2.5">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Enrolled Batches</p>
              <p className="text-xl font-bold text-white mt-0.5">{studentBatches.length}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Attendance Rate</p>
              <p className={`text-xl font-bold mt-0.5 ${attendanceRate >= 80 ? 'text-emerald-400' : attendanceRate >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>
                {attendanceRate}%
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Average Test Score</p>
              <p className="text-xl font-bold text-indigo-300 mt-0.5">
                {averageTestPercent !== null ? `${averageTestPercent}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Assignments Turned In</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{studentSubmissions.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`py-3 px-4 transition-colors ${
              activeTab === 'tests'
                ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assessments & Tests ({studentTests.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-4 transition-colors ${
              activeTab === 'attendance'
                ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Attendance Logs ({studentAttendance.length})
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            className={`py-3 px-4 transition-colors ${
              activeTab === 'homework'
                ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Homework Submissions ({studentSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`py-3 px-4 transition-colors ${
              activeTab === 'fees'
                ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tuition Fee Records ({studentFees.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[55vh] overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Enrolled Batches Under This Teacher */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Enrolled Batches Under Your Instruction
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studentBatches.map((batch) => (
                    <div key={batch.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {batch.code}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">₹{batch.monthlyFee}/mo</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">{batch.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{batch.schedule}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Mentor Remarks */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Teacher's Performance Analysis & Guidance
                  </h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {attendanceRate >= 85
                    ? `${student.name} demonstrates consistent attendance and actively submits homework assignments on time.`
                    : `${student.name} has missed several sessions recently. Recommend following up with parent ${student.parentName || ''} regarding missed concepts.`}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMessageWithStudent(student.id);
                    }}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline"
                  >
                    Send Personal Message / Study Plan →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TESTS */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Test History & Report Card
                </h4>
                <button
                  onClick={() => setShowAddTest(!showAddTest)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Record New Test Score
                </button>
              </div>

              {/* Add Test Form */}
              {showAddTest && (
                <form onSubmit={handleCreateTest} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Add Assessment Result for {student.name}
                  </h5>
                  {feedbackSuccess && (
                    <p className="text-xs text-emerald-600 font-semibold">{feedbackSuccess}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Test Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chapter 4 Quadratic Equations Unit Test"
                        value={newTestName}
                        onChange={(e) => setNewTestName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject</label>
                      <input
                        type="text"
                        value={newTestSubject}
                        onChange={(e) => setNewTestSubject(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Marks Obtained *</label>
                      <input
                        type="number"
                        required
                        value={newTestMarks}
                        onChange={(e) => setNewTestMarks(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Marks *</label>
                      <input
                        type="number"
                        required
                        value={newTestMaxMarks}
                        onChange={(e) => setNewTestMaxMarks(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Instructor Feedback</label>
                    <input
                      type="text"
                      placeholder="e.g. Good grasp of concepts; practice speed on multi-step problems."
                      value={newTestFeedback}
                      onChange={(e) => setNewTestFeedback(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddTest(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded"
                    >
                      Save Score
                    </button>
                  </div>
                </form>
              )}

              {studentTests.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No tests recorded for this student yet. Click "Record New Test Score" above.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {studentTests.map((t) => {
                    const pct = Math.round((t.marksObtained / t.maxMarks) * 100);
                    return (
                      <div key={t.id} className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{t.testName}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {t.subject} · Date: {t.date}
                          </p>
                          {t.feedback && (
                            <p className="text-[11px] text-indigo-700 italic mt-1 bg-indigo-50/50 px-2 py-0.5 rounded">
                              "{t.feedback}"
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-base font-extrabold text-slate-900">
                            {t.marksObtained} <span className="text-xs font-normal text-slate-400">/ {t.maxMarks}</span>
                          </p>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${pct >= 80 ? 'text-emerald-700 bg-emerald-50' : pct >= 60 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'}`}>
                            {pct}% ({t.gradeLetter || 'B'})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Daily Attendance Logs
              </h4>
              {studentAttendance.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No attendance entries recorded for this student yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {studentAttendance.map((a) => (
                    <div key={a.id} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-semibold text-slate-900">{a.date}</p>
                          {a.remarks && <p className="text-[11px] text-slate-500">{a.remarks}</p>}
                        </div>
                      </div>
                      <span className={`font-bold uppercase text-[10px] px-2.5 py-1 rounded ${
                        a.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700'
                          : a.status === 'late'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HOMEWORK */}
          {activeTab === 'homework' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Assignments & Solutions Submitted
              </h4>
              {studentSubmissions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No submissions received from this student yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {studentSubmissions.map((sub) => {
                    const hw = homeworks.find((h) => h.id === sub.homeworkId);
                    return (
                      <div key={sub.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900">{hw?.title || 'Assignment'}</p>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {sub.status === 'graded' ? `Graded: ${sub.marksObtained}/${hw?.maxMarks || 25}` : 'Pending Grading'}
                          </span>
                        </div>
                        <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                          {sub.content}
                        </p>
                        {sub.attachmentName && (
                          <div className="flex items-center gap-1.5 text-indigo-600 font-medium text-[11px]">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Attachment: {sub.attachmentName}</span>
                          </div>
                        )}
                        {sub.feedback && (
                          <p className="text-[11px] text-slate-600 italic">
                            Your Feedback: "{sub.feedback}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FEES */}
          {activeTab === 'fees' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tuition Fee Schedule & Due Dates
              </h4>
              {studentFees.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No fee records generated for this student.
                </div>
              ) : (
                <div className="space-y-3">
                  {studentFees.map((fee) => (
                    <div key={fee.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900">{fee.month}</p>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            fee.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : fee.status === 'verification_pending'
                              ? 'bg-blue-50 text-blue-700'
                              : fee.status === 'overdue'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {fee.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Amount: <strong className="text-slate-800">₹{fee.amount.toLocaleString()}</strong> · Due Date:{' '}
                          <strong className="text-rose-600">{fee.dueDate}</strong>
                        </p>
                        {fee.reminderCount > 0 && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Automated reminders sent: {fee.reminderCount} time(s)
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Edit Due Date inline */}
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500">Edit Due:</span>
                          <input
                            type="date"
                            defaultValue={fee.dueDate}
                            onChange={(e) => setFeeDueDate(fee.id, e.target.value)}
                            className="text-xs border border-slate-300 rounded px-2 py-1 bg-slate-50 font-medium"
                          />
                        </div>

                        {/* Send Automated Reminder */}
                        {fee.status !== 'paid' && (
                          <button
                            onClick={() => {
                              const res = sendFeeReminder(fee.id);
                              alert(res.message);
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send Reminder
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
