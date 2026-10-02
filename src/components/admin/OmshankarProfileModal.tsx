import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  X, 
  Mail, 
  Instagram, 
  Twitter, 
  Copy, 
  Check, 
  ExternalLink,
  Users, 
  BookOpen, 
  DollarSign, 
  Award, 
  ArrowRight,
  Sparkles,
  Lock,
  Phone,
  Shield
} from 'lucide-react';

interface OmshankarProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPanel: () => void;
}

export const OmshankarProfileModal: React.FC<OmshankarProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenAdminPanel 
}) => {
  const { users, batches, feeRecords } = useApp();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  // Admin Profile Coordinates (Completely out of any lock)
  const adminProfile = {
    name: 'Omshankar',
    title: 'Founder & Chief Governing Authority',
    institute: 'Vision Classes Premier Coaching Institute',
    badge: 'Verified System Authority',
    email: 'omshankar27102008@gmail.com',
    backupEmail: 'aryankumar05012008@gmail.com',
    phone: '+91 7465854423',
    instagram: '@omshankar_27',
    instagramUrl: 'https://instagram.com/omshankar_27',
    xHandle: '@omshankar_x',
    xUrl: 'https://x.com/omshankar_x',
    joinedDate: 'January 2026',
    bio: 'Founder and Governing Authority of Vision Classes. Spearheading academic excellence, faculty appointments, student admission governance, and secure institutional operations for Grades 5 through 12.',
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const totalTeachers = users.filter((u) => u.role === 'teacher').length;
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalBatches = batches.length;
  const totalFeesCollected = feeRecords
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg ring-2 ring-amber-300/30">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">Omshankar</h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  Founder & Authority
                </span>
              </div>
              <p className="text-xs text-slate-300">Vision Classes Official Governing Profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Unlocked & Completely Accessible) */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Profile Card */}
          <div className="p-6 bg-gradient-to-br from-amber-50/60 via-white to-slate-50 border border-amber-200/70 rounded-3xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-700 to-slate-900 flex items-center justify-center text-amber-400 text-2xl font-black shadow-lg ring-4 ring-amber-100">
                  OS
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-extrabold text-slate-900">{adminProfile.name}</h4>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                      {adminProfile.badge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                    {adminProfile.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {adminProfile.institute} · Active since {adminProfile.joinedDate}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-white/80 p-2.5 rounded-xl border border-slate-200 sm:bg-transparent sm:border-0 sm:p-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Clearance</span>
                <p className="text-xs font-mono font-extrabold text-indigo-900">LEVEL-4 (FOUNDER)</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-white/90 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              {adminProfile.bio}
            </p>
          </div>

          {/* Social Handles & Contact Coordinates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Official Social Coordinates & Contact Channels
              </h5>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Directly Reachable
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Instagram Handle */}
              <div className="p-4 bg-white border border-slate-200 hover:border-pink-300 rounded-2xl shadow-2xs transition-all space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => handleCopy(adminProfile.instagram, 'instagram')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                    title="Copy Instagram handle"
                  >
                    {copiedField === 'instagram' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Instagram</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{adminProfile.instagram}</p>
                </div>
                <a
                  href={adminProfile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 hover:underline pt-0.5"
                >
                  Visit Instagram <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* X / Twitter Handle */}
              <div className="p-4 bg-white border border-slate-200 hover:border-slate-400 rounded-2xl shadow-2xs transition-all space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs">
                    <Twitter className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => handleCopy(adminProfile.xHandle, 'x')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                    title="Copy X handle"
                  >
                    {copiedField === 'x' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">X (Twitter)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{adminProfile.xHandle}</p>
                </div>
                <a
                  href={adminProfile.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 hover:underline pt-0.5"
                >
                  Visit X Profile <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Official Email */}
              <div className="p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-2xs transition-all space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => handleCopy(adminProfile.email, 'email')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                    title="Copy email"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Official Admin Email</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{adminProfile.email}</p>
                  <p className="text-[10px] text-slate-500 truncate">{adminProfile.backupEmail}</p>
                </div>
                <a
                  href={`mailto:${adminProfile.email}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline pt-0.5"
                >
                  Send Direct Mail <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Institutional Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400">Faculty Members</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalTeachers}</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled</p>
              <p className="text-xl font-extrabold text-indigo-600 mt-0.5">{totalStudents}</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400">Active Batches</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalBatches}</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400">Tuition Volume</p>
              <p className="text-xl font-extrabold text-emerald-600 mt-0.5">₹{totalFeesCollected.toLocaleString()}</p>
            </div>
          </div>

          {/* Gateway to Full Administrative Access Panel */}
          <div className="p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-lg border border-indigo-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-black text-white">Full Admin Access Panel</h4>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Manage all user accounts, notice all activity logs, terminate or add any teacher or student, and view all batch codes & passkeys.
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAdminPanel();
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-[1.02]"
            >
              <span>Launch Admin Access Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Vision Classes Official Governing Profile · Open Access
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
