import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Key, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Clock, 
  DollarSign,
  GraduationCap,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinClassModal: React.FC<JoinClassModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, batches, requestJoinBatch } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const foundBatch = batches.find(
    (b) => b.code.toUpperCase().trim() === code.toUpperCase().trim() && b.active
  );

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!code.trim()) {
      setError('Please enter your instructor-provided batch code.');
      return;
    }

    const res = requestJoinBatch(code.trim(), currentUser.id);

    if (res.success) {
      setSuccess(res.message);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Join a Coaching Class</h3>
              <p className="text-xs text-slate-300">Enter Your Instructor's Unique Code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructor Batch Code *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="ENTER BATCH CODE"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-blue-700 tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Enter the private batch code given to you by your teacher.</span>
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>How Admission Approval Works</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Batch codes are confidential and provided only by your subject instructor. Once entered, your teacher will verify and approve your enrollment.
            </p>
          </div>

          {/* Matching Preview Card when code matches an active batch */}
          {foundBatch && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-100">
                  {foundBatch.grade} · {foundBatch.subject}
                </span>
                <span className="text-xs font-bold text-slate-900">₹{foundBatch.monthlyFee}/month</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{foundBatch.name}</h4>
              <p className="text-xs text-slate-600">Instructor: <strong>{foundBatch.teacherName}</strong></p>
              {foundBatch.joiningMonth && (
                <p className="text-xs text-amber-800 font-bold">Joining: {foundBatch.joiningMonth}</p>
              )}
              <p className="text-xs text-slate-500">Schedule: {foundBatch.schedule}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Submit Admission Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
