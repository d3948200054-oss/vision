import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Homework, HomeworkSubmission } from '../../types';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Award, 
  Send,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface HomeworkTrackerProps {
  initialBatchId?: string;
}

export const HomeworkTracker: React.FC<HomeworkTrackerProps> = ({ initialBatchId }) => {
  const {
    currentUser,
    batches,
    homeworks,
    homeworkSubmissions,
    enrollments,
    createHomework,
    gradeHomeworkSubmission,
  } = useApp();

  const myBatches = batches.filter((b) => b.teacherId === currentUser?.id);
  const myBatchIds = myBatches.map((b) => b.id);

  const teacherHomeworks = homeworks.filter((h) => myBatchIds.includes(h.batchId));

  const [selectedHwId, setSelectedHwId] = useState<string>(teacherHomeworks[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Homework Form State
  const [hwTitle, setHwTitle] = useState('');
  const [hwBatchId, setHwBatchId] = useState(myBatches[0]?.id || '');
  const [hwDueDate, setHwDueDate] = useState('2026-10-05');
  const [hwMaxMarks, setHwMaxMarks] = useState('25');
  const [hwInstructions, setHwInstructions] = useState('');
  const [hwFileUrl, setHwFileUrl] = useState('');

  // Grading state for modal / inline
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradeSuccess, setGradeSuccess] = useState(false);

  const selectedHomework = teacherHomeworks.find((h) => h.id === selectedHwId);

  // Submissions for selected homework
  const submissionsForHw = homeworkSubmissions.filter((s) => s.homeworkId === selectedHwId);

  // Total enrolled students in selected homework's batch
  const enrolledInBatch = selectedHomework
    ? enrollments.filter((e) => e.batchId === selectedHomework.batchId && e.status === 'active').length
    : 0;

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find((b) => b.id === hwBatchId);
    if (!batch) return;

    createHomework({
      title: hwTitle.trim(),
      description: hwInstructions.trim(),
      batchId: batch.id,
      batchName: batch.name,
      grade: batch.grade,
      subject: batch.subject,
      dueDate: new Date(hwDueDate + 'T23:59:59Z').toISOString(),
      maxMarks: parseFloat(hwMaxMarks) || 25,
      attachedFileUrl: hwFileUrl || undefined,
    });

    setShowCreateModal(false);
    setHwTitle('');
    setHwInstructions('');
  };

  const handleGradeSubmission = (subId: string) => {
    const marks = parseFloat(gradeMarks);
    if (isNaN(marks)) return;

    gradeHomeworkSubmission(subId, marks, gradeFeedback.trim() || 'Good attempt.');
    setGradingSubId(null);
    setGradeMarks('');
    setGradeFeedback('');
    setGradeSuccess(true);
    setTimeout(() => setGradeSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Homework & Assignment Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Assign homework with due dates and rubrics, track student submissions, and award marks with personalized remarks.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Assign New Homework
        </button>
      </div>

      {gradeSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Marks and personalized feedback published to student dashboard!</span>
        </div>
      )}

      {/* Main Layout: Left Homework Selector / Right Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Homeworks */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Assignments ({teacherHomeworks.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {teacherHomeworks.map((hw) => {
              const count = homeworkSubmissions.filter((s) => s.homeworkId === hw.id).length;
              const isSelected = hw.id === selectedHwId;

              return (
                <div
                  key={hw.id}
                  onClick={() => setSelectedHwId(hw.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-100">
                      {hw.grade} · {hw.subject}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Due: {new Date(hw.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{hw.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span>Max Marks: {hw.maxMarks}</span>
                    <span className="font-semibold text-indigo-600">{count} Submitted</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Submissions for Selected Homework */}
        <div className="lg:col-span-2 space-y-4">
          {selectedHomework ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Assignment Detail Bar */}
              <div className="p-6 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
                    {selectedHomework.batchName}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: <strong>{new Date(selectedHomework.dueDate).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedHomework.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedHomework.description}</p>

                <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400">Total Enrolled:</span>{' '}
                    <strong className="text-slate-900">{enrolledInBatch}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Turned In:</span>{' '}
                    <strong className="text-indigo-600">{submissionsForHw.length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Graded:</span>{' '}
                    <strong className="text-emerald-600">
                      {submissionsForHw.filter((s) => s.status === 'graded').length}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Max Marks:</span>{' '}
                    <strong className="text-slate-900">{selectedHomework.maxMarks}</strong>
                  </div>
                </div>
              </div>

              {/* Submissions List */}
              <div className="p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Student Solutions Received ({submissionsForHw.length})
                </h4>

                {submissionsForHw.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    No student submissions yet for this homework.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissionsForHw.map((sub) => {
                      const isGradingThis = gradingSubId === sub.id;

                      return (
                        <div
                          key={sub.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                                {sub.studentName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{sub.studentName}</p>
                                <p className="text-[10px] text-slate-400">
                                  Turned in: {new Date(sub.submittedAt).toLocaleDateString()} at{' '}
                                  {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>

                            <div>
                              {sub.status === 'graded' ? (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                                  Graded: {sub.marksObtained} / {selectedHomework.maxMarks}
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setGradingSubId(sub.id);
                                    setGradeMarks(String(selectedHomework.maxMarks - 2));
                                    setGradeFeedback('Good work, clean derivations.');
                                  }}
                                  className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md transition-colors"
                                >
                                  Grade Submission
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Student Answer Text */}
                          <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                            <p className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                              Student's Answer Note:
                            </p>
                            <p>{sub.content}</p>
                            {sub.attachmentName && (
                              <div className="mt-2 flex items-center gap-1.5 text-indigo-600 font-semibold text-[11px]">
                                <FileText className="w-3.5 h-3.5" />
                                <span>Attached File: {sub.attachmentName}</span>
                              </div>
                            )}
                          </div>

                          {/* Previous Feedback if Graded */}
                          {sub.feedback && (
                            <p className="text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 italic">
                              Teacher Feedback: "{sub.feedback}"
                            </p>
                          )}

                          {/* Inline Grading Form */}
                          {isGradingThis && (
                            <div className="p-3 bg-white border border-indigo-200 rounded-xl space-y-3">
                              <h5 className="text-xs font-bold text-indigo-900">
                                Award Marks & Remarks to {sub.studentName}
                              </h5>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Marks (Max: {selectedHomework.maxMarks}) *
                                  </label>
                                  <input
                                    type="number"
                                    max={selectedHomework.maxMarks}
                                    value={gradeMarks}
                                    onChange={(e) => setGradeMarks(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Teacher Remarks / Tips
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Excellent presentation, revise step 3"
                                    value={gradeFeedback}
                                    onChange={(e) => setGradeFeedback(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setGradingSubId(null)}
                                  className="px-3 py-1 text-xs text-slate-500"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGradeSubmission(sub.id)}
                                  className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded"
                                >
                                  Save & Send Grade
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-400">
              Select an assignment on the left or create a new one.
            </div>
          )}
        </div>
      </div>

      {/* CREATE HOMEWORK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Assign New Homework</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateHomework} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Batch *</label>
                <select
                  value={hwBatchId}
                  onChange={(e) => setHwBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  {myBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exercise 4.3 Quadratic Equations Word Problems"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Due Date *</label>
                  <input
                    type="date"
                    required
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Total Marks *</label>
                  <input
                    type="number"
                    required
                    value={hwMaxMarks}
                    onChange={(e) => setHwMaxMarks(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Instructions</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Solve questions 1 to 10 in your homework notebook. Clearly write the discriminant."
                  value={hwInstructions}
                  onChange={(e) => setHwInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Publish Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
