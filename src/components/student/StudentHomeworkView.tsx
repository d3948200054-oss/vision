import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Homework, HomeworkSubmission } from '../../types';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  UploadCloud, 
  Download, 
  ExternalLink,
  Award
} from 'lucide-react';

export const StudentHomeworkView: React.FC = () => {
  const { currentUser, homeworks, homeworkSubmissions, enrollments, submitHomework } = useApp();

  const [submittingHw, setSubmittingHw] = useState<Homework | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!currentUser) return null;

  // Batches enrolled in
  const myEnrollments = enrollments.filter((e) => e.studentId === currentUser.id && e.status === 'active');
  const myBatchIds = myEnrollments.map((e) => e.batchId);

  // Homework for those batches
  const myHomeworks = homeworks.filter((h) => myBatchIds.includes(h.batchId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw) return;

    submitHomework({
      homeworkId: submittingHw.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      batchId: submittingHw.batchId,
      content: submissionText.trim(),
      attachmentName: attachmentName.trim() || undefined,
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setSubmittingHw(null);
      setSubmissionText('');
      setAttachmentName('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Homework & Assignments
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete and submit assignments assigned by your instructors. Review graded marks and teacher comments.
        </p>
      </div>

      {/* Homework List */}
      {myHomeworks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-400">
          No homework assignments currently assigned.
        </div>
      ) : (
        <div className="space-y-4">
          {myHomeworks.map((hw) => {
            const submission = homeworkSubmissions.find(
              (s) => s.homeworkId === hw.id && s.studentId === currentUser.id
            );

            const isPastDue = new Date(hw.dueDate) < new Date();

            return (
              <div
                key={hw.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
                      {hw.batchName}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">· Max: {hw.maxMarks} marks</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: <strong>{new Date(hw.dueDate).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{hw.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {hw.description}
                </p>

                {hw.attachedFileUrl && (
                  <div className="pt-1">
                    <a
                      href={hw.attachedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Teacher's Assignment Worksheet / Question Paper
                    </a>
                  </div>
                )}

                {/* Submission Status or Action */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {submission ? (
                    <div className="space-y-2 w-full">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                          submission.status === 'graded'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {submission.status === 'graded'
                            ? `Graded: ${submission.marksObtained} / ${hw.maxMarks} marks`
                            : 'Submitted · Awaiting Teacher Grading'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Turned in on {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {submission.feedback && (
                        <p className="text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 italic">
                          Teacher's Remarks: "{submission.feedback}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-amber-600 font-medium">
                        {isPastDue ? 'Past deadline' : 'Not submitted yet'}
                      </span>
                      <button
                        onClick={() => setSubmittingHw(hw)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Turn In Solution
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBMISSION MODAL */}
      {submittingHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Submit Assignment Solution</h3>
                <p className="text-xs text-slate-300">{submittingHw.title}</p>
              </div>
              <button
                onClick={() => setSubmittingHw(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Homework Submitted Successfully!</h4>
                <p className="text-xs text-slate-500">Your instructor has been notified to grade your submission.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Solution Notes / Final Answers *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your derivation steps, final root values, or answers..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Attached File / Photo Reference Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav_Math_HW_Answers.pdf or Photo_Page1.jpg"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittingHw(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Turn In Assignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
