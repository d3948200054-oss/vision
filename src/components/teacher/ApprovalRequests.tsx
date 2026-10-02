import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JoinRequest } from '../../types';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';

export const ApprovalRequests: React.FC = () => {
  const { currentUser, joinRequests, approveJoinRequest, rejectJoinRequest } = useApp();
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Filter requests for batches belonging to CURRENT TEACHER
  const teacherRequests = joinRequests.filter((r) => r.teacherId === currentUser?.id);
  const pendingRequests = teacherRequests.filter((r) => r.status === 'pending');
  const displayedRequests = filter === 'pending' ? pendingRequests : teacherRequests;

  const handleReject = (requestId: string) => {
    rejectJoinRequest(requestId, rejectReason || 'Batch capacity full or criteria mismatch.');
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Student Admission Approvals
            </h2>
            {pendingRequests.length > 0 && (
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                {pendingRequests.length} Waiting
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Students who entered your unique batch code wait for your approval before getting access to class notes and assignments.
          </p>
        </div>

        {/* Filter segment */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'pending'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingRequests.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Requests ({teacherRequests.length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      {displayedRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            {filter === 'pending' ? 'All caught up!' : 'No admission requests recorded'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When new students register and enter your unique batch code, their approval request will appear here immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedRequests.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-2xl border transition-all p-5 ${
                req.status === 'pending'
                  ? 'border-amber-300 shadow-sm ring-1 ring-amber-300/40'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Student Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{req.studentName}</h4>
                    <span className="text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                      {req.grade}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      req.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : req.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    Requested Batch: <strong className="text-slate-900">{req.batchName}</strong> (Code entered:{' '}
                    <span className="font-mono font-bold text-blue-700">{req.batchCode}</span>)
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {req.studentEmail}
                    </span>
                    {req.studentPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {req.studentPhone}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      Requested: {new Date(req.requestedAt).toLocaleDateString()} at{' '}
                      {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {req.status === 'pending' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    {rejectingId === req.id ? (
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          placeholder="Rejection reason..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                        />
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => setRejectingId(null)}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setRejectingId(req.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200"
                        >
                          <UserX className="w-4 h-4" />
                          Decline
                        </button>
                        <button
                          onClick={() => approveJoinRequest(req.id)}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          Approve Student
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">
                      Reviewed on {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : 'N/A'}
                    </p>
                    {req.rejectionReason && (
                      <p className="text-[11px] text-rose-600 italic mt-0.5">Reason: {req.rejectionReason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
