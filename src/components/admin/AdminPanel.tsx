import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeLevel, User, UserRole, Batch, FeeRecord, AppLogoConfig } from '../../types';
import { 
  ShieldCheck, 
  X, 
  Mail, 
  Phone, 
  Copy, 
  Check, 
  Key, 
  Users, 
  BookOpen, 
  DollarSign, 
  Lock, 
  Unlock, 
  Trash2, 
  UserPlus, 
  Search, 
  Filter, 
  Clock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Plus,
  Cpu,
  Upload,
  Palette,
  Image as ImageIcon,
  Flame,
  Award,
  School,
  Compass,
  FileCheck2,
  Calendar,
  Send
} from 'lucide-react';
import { OFFICIAL_TEACHER_ACCESS_KEY, SECONDARY_TEACHER_ACCESS_KEY } from '../../data/mockData';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADES_LIST: GradeLevel[] = [
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

const PRESET_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science Foundation', 'English', 'Social Science'];

const PRESET_ICONS = [
  { name: 'GraduationCap', label: 'Graduation Cap' },
  { name: 'BookOpen', label: 'Open Book' },
  { name: 'Award', label: 'Excellence Award' },
  { name: 'ShieldCheck', label: 'Shield & Honor' },
  { name: 'Flame', label: 'Knowledge Flame' },
  { name: 'Sparkles', label: 'Sparkles Crest' },
  { name: 'School', label: 'Academy Building' },
  { name: 'Compass', label: 'Direction Compass' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { 
    users, 
    batches, 
    activityLogs, 
    customPasskeys, 
    terminateUser, 
    toggleUserStatus, 
    adminAddUser,
    addCustomPasskey,
    createBatch,
    feeRecords,
    verifyFeePayment,
    appLogo,
    updateAppLogo,
    resetAppLogo,
    deleteDummyAccountsAndPortalData,
    reloadSampleDemoData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'codes' | 'logo' | 'payments'>('users');

  // Security Gate State (Password protected with omshankar or Omshankar)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = passwordInput.trim();
    if (cleaned === 'omshankar' || cleaned === 'Omshankar' || cleaned.toLowerCase() === 'omshankar') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Access Denied: Invalid administrator password. This panel is strictly restricted to Omshankar.');
    }
  };

  const handleLockPanel = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
    onClose();
  };

  // Search & Filter in Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'teacher' | 'student'>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Termination confirmation state
  const [userToTerminate, setUserToTerminate] = useState<User | null>(null);

  // Purge Dummy Data Confirmation state
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeNotice, setPurgeNotice] = useState<string | null>(null);

  // Add User Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addRole, setAddRole] = useState<UserRole>('teacher');
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('vision123');
  const [addPhone, setAddPhone] = useState('');
  const [addGrade, setAddGrade] = useState<GradeLevel>('Class 10');
  const [addParentName, setAddParentName] = useState('');
  const [addParentPhone, setAddParentPhone] = useState('');
  const [addUpiId, setAddUpiId] = useState('');
  const [addBio, setAddBio] = useState('');
  
  // Teacher Class-Subject assignments
  const [teacherClassAssignments, setTeacherClassAssignments] = useState<Record<string, string[]>>({
    'Class 10': ['Mathematics'],
  });

  // Add Custom Passkey State
  const [newPasskeyInput, setNewPasskeyInput] = useState('');
  const [passkeyNotice, setPasskeyNotice] = useState<string | null>(null);

  // Search in Activity
  const [activitySearch, setActivitySearch] = useState('');
  const [activityRoleFilter, setActivityRoleFilter] = useState<string>('all');

  // App Logo & Branding Editor State
  const [logoForm, setLogoForm] = useState<AppLogoConfig>({ ...appLogo });
  const [logoNotice, setLogoNotice] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // AI Payment Forensic Modal State
  const [viewingAiRecord, setViewingAiRecord] = useState<FeeRecord | null>(null);
  const [feeFilter, setFeeFilter] = useState<'all' | 'proxy' | 'pending' | 'paid'>('all');
  const [feeSearch, setFeeSearch] = useState('');

  // Copied state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const toggleTeacherGrade = (grade: GradeLevel) => {
    setTeacherClassAssignments((prev) => {
      const copy = { ...prev };
      if (copy[grade]) {
        delete copy[grade];
      } else {
        copy[grade] = ['Mathematics'];
      }
      return copy;
    });
  };

  const toggleTeacherSubjectInGrade = (grade: GradeLevel, subject: string) => {
    setTeacherClassAssignments((prev) => {
      const existing = prev[grade] || [];
      const updated = existing.includes(subject)
        ? existing.filter((s) => s !== subject)
        : [...existing, subject];
      return {
        ...prev,
        [grade]: updated.length > 0 ? updated : [subject],
      };
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) return;

    if (addRole === 'teacher') {
      const classSubjectAssignments = Object.entries(teacherClassAssignments).flatMap(
        ([grade, subs]) => subs.map((sub) => ({ grade: grade as GradeLevel, subject: sub }))
      );

      const uniqueSubjects = Array.from(new Set(classSubjectAssignments.map((a) => a.subject)));

      adminAddUser({
        name: addName.trim(),
        email: addEmail.toLowerCase().trim(),
        password: addPassword.trim() || 'demo1234',
        role: 'teacher',
        phone: addPhone.trim() || '+91 98000 00000',
        upiId: addUpiId.trim() || 'visionclasses@upi',
        bio: addBio.trim() || 'Faculty appointed by Admin Omshankar.',
        subjects: uniqueSubjects.length > 0 ? uniqueSubjects : ['Mathematics'],
        classSubjectAssignments: classSubjectAssignments.length > 0 ? classSubjectAssignments : [{ grade: 'Class 10', subject: 'Mathematics' }],
      });
    } else {
      adminAddUser({
        name: addName.trim(),
        email: addEmail.toLowerCase().trim(),
        password: addPassword.trim() || 'demo1234',
        role: 'student',
        grade: addGrade,
        phone: addPhone.trim() || '+91 90000 00000',
        parentName: addParentName.trim() || 'Parent/Guardian',
        parentPhone: addParentPhone.trim() || '+91 90000 00001',
      });
    }

    setShowAddUserModal(false);
    setAddName('');
    setAddEmail('');
    setAddPassword('vision123');
    setAddPhone('');
    setAddUpiId('');
    setAddBio('');
  };

  const handleConfirmTerminate = () => {
    if (userToTerminate) {
      terminateUser(userToTerminate.id);
      setUserToTerminate(null);
    }
  };

  const handlePurgeDummyData = () => {
    const res = deleteDummyAccountsAndPortalData();
    setShowPurgeModal(false);
    setPurgeNotice(
      `Purged ${res.deletedUsers} dummy accounts, ${res.deletedBatches} mock batches, and ${res.deletedRecords} dummy records. Portals are now pristine for live registrations!`
    );
    setTimeout(() => setPurgeNotice(null), 5000);
  };

  const handleReloadDemoData = () => {
    reloadSampleDemoData();
    setPurgeNotice('Sample demo dataset reloaded into teacher and student portals.');
    setTimeout(() => setPurgeNotice(null), 4000);
  };

  const handleAddPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasskeyInput.trim()) return;
    addCustomPasskey(newPasskeyInput.trim().toUpperCase());
    setPasskeyNotice(`Added new passkey "${newPasskeyInput.trim().toUpperCase()}"!`);
    setNewPasskeyInput('');
    setTimeout(() => setPasskeyNotice(null), 3000);
  };

  // Save Logo & Brand Changes
  const handleSaveLogo = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppLogo(logoForm);
    setLogoNotice('App logo and branding updated successfully across all portals!');
    setTimeout(() => setLogoNotice(null), 4000);
  };

  const handleResetLogo = () => {
    resetAppLogo();
    setLogoForm({
      type: 'icon',
      iconName: 'GraduationCap',
      instituteName: 'Vision',
      highlightWord: 'Classes',
      tagline: 'Coaching Management & Personalized Learning Portal',
      badgeText: 'Grades 5–12',
      accentColor: 'indigo',
    });
    setLogoNotice('Restored original default logo and styling.');
    setTimeout(() => setLogoNotice(null), 3000);
  };

  const handleLogoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoForm((prev) => ({
        ...prev,
        type: 'image',
        imageUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const q = userSearch.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      (u.phone && u.phone.includes(q)) || 
      (u.grade && u.grade.toLowerCase().includes(q)) ||
      (u.subjects && u.subjects.some((s) => s.toLowerCase().includes(q)));
    return matchesRole && matchesSearch;
  });

  // Filtered Activities
  const filteredActivities = activityLogs.filter((log) => {
    const matchesRole = activityRoleFilter === 'all' || log.userRole === activityRoleFilter;
    const q = activitySearch.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      log.action.toLowerCase().includes(q) || 
      log.userName.toLowerCase().includes(q) || 
      log.details.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  // Filtered Fee Payments (for AI Monitor tab)
  const filteredFeePayments = feeRecords.filter((rec) => {
    const isProxy = rec.isFlaggedAsProxy || rec.aiAnalysis?.isProxy;
    if (feeFilter === 'proxy' && !isProxy) return false;
    if (feeFilter === 'pending' && rec.status !== 'verification_pending') return false;
    if (feeFilter === 'paid' && rec.status !== 'paid') return false;

    const q = feeSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      rec.studentName.toLowerCase().includes(q) ||
      rec.batchName.toLowerCase().includes(q) ||
      (rec.transactionRef && rec.transactionRef.toLowerCase().includes(q)) ||
      (rec.paidBy && rec.paidBy.toLowerCase().includes(q))
    );
  });

  const totalProxyAlerts = feeRecords.filter((r) => r.isFlaggedAsProxy || r.aiAnalysis?.isProxy).length;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
          {/* Security Gate Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-6 text-white text-center relative border-b border-slate-800">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg ring-4 ring-amber-300/30 mb-3">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Admin Access Panel
            </h3>
            <p className="text-xs text-blue-200 mt-1 font-medium">
              Restricted Authority Gate · Password Required
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleUnlock} className="p-6 space-y-4">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Restricted Access: Founder Omshankar</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                This administrative control center manages all portal users, passkeys, curriculum batches, and payment audits. Please enter the security password to proceed.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                Administrator Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  placeholder="Enter security password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Secured with administrator passkey</span>
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Authenticate & Unlock Admin Panel</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">Admin Access Panel</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Omshankar Control Center
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" />
                  Unlocked
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Notice all users, inspect full activity, update logo, purge dummy data, and monitor Algorithmic AI fee proxy checks.
              </p>
            </div>
          </div>

          {/* Clean Dummy Data, Lock Panel & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleLockPanel}
              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs hover:scale-[1.02]"
              title="Lock admin access panel immediately"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Lock Panel</span>
            </button>

            <button
              onClick={() => setShowPurgeModal(true)}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs hover:scale-[1.02]"
              title="Delete all dummy/seed accounts and dummy data from student and teacher portals"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete Dummy Accounts & Data</span>
            </button>

            <button
              onClick={handleReloadDemoData}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
              title="Restore sample demo data if you want to inspect mock records again"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reload Demo Data</span>
            </button>

            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Purge or Action Notice */}
        {purgeNotice && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{purgeNotice}</span>
            </div>
            <button onClick={() => setPurgeNotice(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'activity'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Activity Feed ({activityLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('codes')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'codes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Passkeys & Codes ({batches.length})</span>
            </button>

            {/* TAB 4: APP LOGO & BRANDING STUDIO */}
            <button
              onClick={() => setActiveTab('logo')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'logo'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>App Logo & Branding</span>
            </button>

            {/* TAB 5: AI PAYMENT PROXY MONITOR */}
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'payments'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              <span>AI Payment & Proxy Monitor</span>
              {totalProxyAlerts > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                  {totalProxyAlerts}
                </span>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500">Administrator: <strong>Omshankar</strong></span>
          </div>
        </div>

        {/* Tab 1: All Users Directory & Management */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by name, email, class, or subject..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="all">All Roles</option>
                  <option value="teacher">Teachers Only</option>
                  <option value="student">Students Only</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Teacher or Student</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">User Name & Identity</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Classes & Subjects</th>
                      <th className="py-3 px-3">Contact Details</th>
                      <th className="py-3 px-3">Credentials & Passwords</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const isTeacher = user.role === 'teacher';
                      const isSuspended = user.status === 'suspended';
                      const isPassVisible = !!visiblePasswords[user.id];

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                                alt={user.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <p className="font-extrabold text-slate-900">{user.name}</p>
                                <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              isTeacher
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {user.role}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            {isTeacher ? (
                              <div className="space-y-1">
                                {user.classSubjectAssignments && user.classSubjectAssignments.length > 0 ? (
                                  user.classSubjectAssignments.map((a, i) => (
                                    <span key={i} className="inline-block text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-medium mr-1 mb-0.5 border border-slate-200">
                                      {a.grade}: <strong>{a.subject}</strong>
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    {user.subjects?.join(', ') || 'Faculty'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-800">{user.grade || 'Class 10'}</span>
                                {user.parentName && (
                                  <p className="text-[10px] text-slate-500">Parent: {user.parentName}</p>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-slate-600">
                            <p className="font-mono text-slate-800 text-[11px]">{user.phone || '+91 90000 00000'}</p>
                            {isTeacher && user.upiId && (
                              <p className="text-[10px] text-indigo-600 font-mono mt-0.5">UPI: {user.upiId}</p>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg w-fit">
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {isPassVisible ? (user.password || 'demo1234') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(user.id)}
                                className="text-slate-400 hover:text-slate-700 p-0.5"
                                title={isPassVisible ? 'Hide Password' : 'Show Password'}
                              >
                                {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isSuspended
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => toggleUserStatus(user.id)}
                                className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                                  isSuspended
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                                title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                              >
                                {isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => setUserToTerminate(user)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                                title="Terminate & Remove User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Real-Time Activity Feed */}
        {activeTab === 'activity' && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search actions, names, or event details..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <select
                  value={activityRoleFilter}
                  onChange={(e) => setActivityRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="all">All Roles</option>
                  <option value="teacher">Teachers</option>
                  <option value="student">Students</option>
                  <option value="admin">Admin Omshankar</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Live chronological audit trail of all platform activities.
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredActivities.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 shadow-2xs transition-all flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      log.userRole === 'admin'
                        ? 'bg-amber-100 text-amber-800'
                        : log.userRole === 'teacher'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {log.userRole === 'admin' ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : log.userRole === 'teacher' ? (
                        <GraduationCap className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-slate-900">{log.action}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 uppercase">
                          {log.userName} ({log.userRole})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: All Passkeys & Batch Codes */}
        {activeTab === 'codes' && (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    Confidential Teacher Registration Passkeys (Admin Registry)
                  </h4>
                  <p className="text-xs text-amber-800">
                    Authorized passkeys required for faculty registration. Hidden from public view.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {customPasskeys.map((key) => (
                  <div key={key} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                    <span className="font-mono font-black text-xs text-amber-900">{key}</span>
                    <button
                      onClick={() => handleCopy(key, `key-${key}`)}
                      className="p-1 rounded text-slate-400 hover:text-amber-700 transition-colors"
                      title="Copy Passkey"
                    >
                      {copiedText === `key-${key}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddPasskey} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="NEW-PASSKEY-XXXX"
                  value={newPasskeyInput}
                  onChange={(e) => setNewPasskeyInput(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 uppercase"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue New Passkey</span>
                </button>
                {passkeyNotice && <span className="text-xs font-bold text-emerald-700">{passkeyNotice}</span>}
              </form>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Master Batch Joining Codes ({batches.length} Batches)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Hidden from students in their portal. Instructors or Admin Omshankar provide these directly.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Batch Code</th>
                      <th className="py-3 px-3">Batch Name</th>
                      <th className="py-3 px-3">Grade & Subject</th>
                      <th className="py-3 px-3">Instructor</th>
                      <th className="py-3 px-3">Weekly Schedule</th>
                      <th className="py-3 px-3">Tuition Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md">
                              {batch.code}
                            </span>
                            <button
                              onClick={() => handleCopy(batch.code, `batch-${batch.id}`)}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Copy Batch Code"
                            >
                              {copiedText === `batch-${batch.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{batch.name}</td>
                        <td className="py-3 px-3">
                          <span className="text-slate-800 font-semibold">{batch.grade}</span>
                          <span className="text-slate-400"> · </span>
                          <span className="text-indigo-600 font-medium">{batch.subject}</span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">{batch.teacherName}</td>
                        <td className="py-3 px-3 text-slate-500 font-medium">{batch.schedule}</td>
                        <td className="py-3 px-3 font-bold text-emerald-700">₹{batch.monthlyFee}/mo</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APP LOGO & BRANDING STUDIO (User Request 1) */}
        {activeTab === 'logo' && (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-5 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-indigo-950">App Logo & Brand Identity Studio</h4>
                  <p className="text-xs text-indigo-800">
                    Customize the application logo, institute name, tagline, and vector crest anytime. Reflects instantly across Navbar, Modals, and Portals.
                  </p>
                </div>
              </div>

              {logoNotice && (
                <div className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl animate-fadeIn">
                  {logoNotice}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Controls */}
              <form onSubmit={handleSaveLogo} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Logo Configuration Settings
                </h5>

                {/* Logo Graphic Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Logo Graphic Type</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLogoForm((prev) => ({ ...prev, type: 'icon' }))}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        logoForm.type === 'icon' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Vector Emblem / Crest</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoForm((prev) => ({ ...prev, type: 'image' }))}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        logoForm.type === 'image' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Custom Image / Photo</span>
                    </button>
                  </div>
                </div>

                {/* If Vector Icon */}
                {logoForm.type === 'icon' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Select Vector Emblem Preset
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_ICONS.map((ico) => {
                        const isSelected = logoForm.iconName === ico.name;
                        return (
                          <button
                            type="button"
                            key={ico.name}
                            onClick={() => setLogoForm((prev) => ({ ...prev, iconName: ico.name }))}
                            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-[1.02]'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span className="text-xs font-bold">{ico.label.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* If Custom Image */
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Upload Logo Image (PNG / JPG / SVG)</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Image File...</span>
                      </button>
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoImageUpload}
                        className="hidden"
                      />
                      <span className="text-xs text-slate-500">
                        {logoForm.imageUrl ? 'Image loaded ✓' : 'No custom image selected yet'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mt-2 mb-1">
                        Or Paste Direct Image URL:
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={logoForm.imageUrl || ''}
                        onChange={(e) => setLogoForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                )}

                {/* Institute Name & Highlight Word */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Institute First Name *</label>
                    <input
                      type="text"
                      required
                      value={logoForm.instituteName}
                      onChange={(e) => setLogoForm((prev) => ({ ...prev, instituteName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Accent Highlight Word *</label>
                    <input
                      type="text"
                      required
                      value={logoForm.highlightWord}
                      onChange={(e) => setLogoForm((prev) => ({ ...prev, highlightWord: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Tagline & Badge Text */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sub-Tagline</label>
                    <input
                      type="text"
                      value={logoForm.tagline}
                      onChange={(e) => setLogoForm((prev) => ({ ...prev, tagline: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text (e.g. Grades)</label>
                    <input
                      type="text"
                      value={logoForm.badgeText}
                      onChange={(e) => setLogoForm((prev) => ({ ...prev, badgeText: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Reset to Default Logo
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save & Update App Logo</span>
                  </button>
                </div>
              </form>

              {/* Live Preview Pane */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Live Brand Preview (Real-Time Render)
                  </h5>

                  {/* Preview 1: In Navbar */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Top Navbar Header Preview
                    </span>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md overflow-hidden">
                        {logoForm.type === 'image' && logoForm.imageUrl ? (
                          <img src={logoForm.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <GraduationCap className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xl tracking-tight text-slate-900">
                            {logoForm.instituteName}<span className="text-indigo-600">{logoForm.highlightWord}</span>
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {logoForm.badgeText}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-tight">
                          {logoForm.tagline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Preview 2: On Dark Landing Hero */}
                  <div className="p-5 bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-900 shadow-md space-y-2">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                      Landing Hero Preview
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">{logoForm.instituteName} {logoForm.highlightWord}</span>
                    </h3>
                    <p className="text-xs text-indigo-200">
                      {logoForm.tagline}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI PAYMENT PROXY & FRAUD MONITOR (User Request 3) */}
        {activeTab === 'payments' && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-5 rounded-2xl text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center shadow-md">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white">
                      Algorithmic Payment AI & Proxy Collision Monitor
                    </h4>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                      Zero External AI Key · Pure Algorithms
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Evaluates all 5 factors: Time, Date, Paid To, Paid By, and cross-student duplicate screenshot/UTR collision.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by student, UTR, payer, or batch..."
                    value={feeSearch}
                    onChange={(e) => setFeeSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <select
                  value={feeFilter}
                  onChange={(e) => setFeeFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="all">All Invoices ({feeRecords.length})</option>
                  <option value="proxy">🚨 AI Proxy Flagged Only ({totalProxyAlerts})</option>
                  <option value="pending">Pending Verifications</option>
                  <option value="paid">Verified Paid</option>
                </select>
              </div>

              <span className="text-xs text-slate-500">
                Found <strong>{filteredFeePayments.length}</strong> matching transaction records
              </span>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Student & Class</th>
                      <th className="py-3 px-3">Batch & Month</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Transaction UTR</th>
                      <th className="py-3 px-3">Payer / Paid To</th>
                      <th className="py-3 px-3">Algorithmic AI Status & Proxy Check</th>
                      <th className="py-3 px-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFeePayments.map((fee) => {
                      const isProxy = fee.isFlaggedAsProxy || fee.aiAnalysis?.isProxy;
                      return (
                        <tr key={fee.id} className={`hover:bg-slate-50/80 transition-colors ${isProxy ? 'bg-rose-50/40' : ''}`}>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>
                              <p>{fee.studentName}</p>
                              <p className="text-[11px] text-slate-500 font-normal">{fee.month}</p>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-slate-800">{fee.batchName}</span>
                          </td>

                          <td className="py-3.5 px-3 font-extrabold text-slate-900">
                            ₹{fee.amount.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-3 font-mono text-xs">
                            {fee.transactionRef ? (
                              <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {fee.transactionRef}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-slate-600">
                            <p className="font-medium">{fee.paidBy || 'Student'}</p>
                            <p className="text-[10px] text-slate-400">To: {fee.paidTo || 'Faculty UPI'}</p>
                          </td>

                          <td className="py-3.5 px-3">
                            {isProxy ? (
                              <button
                                onClick={() => setViewingAiRecord(fee)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 text-[10px] font-black uppercase tracking-wider shadow-2xs animate-pulse"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                <span>🚨 PROXY DETECTED</span>
                              </button>
                            ) : fee.aiAnalysis?.verdict === 'VERIFIED_GENUINE' ? (
                              <button
                                onClick={() => setViewingAiRecord(fee)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>AI Genuine ({fee.aiAnalysis.confidenceScore}%)</span>
                              </button>
                            ) : fee.transactionRef ? (
                              <button
                                onClick={() => setViewingAiRecord(fee)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold"
                              >
                                <Cpu className="w-3.5 h-3.5" />
                                <span>Audit AI Report</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Unsubmitted</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setViewingAiRecord(fee)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Report</span>
                              </button>

                              {fee.status === 'verification_pending' && (
                                <>
                                  <button
                                    onClick={() => verifyFeePayment(fee.id, true)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-2xs"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => verifyFeePayment(fee.id, false, isProxy ? 'Rejected as proxy by Admin Omshankar' : undefined, isProxy)}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-2xs"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium">
            Admin Access Panel · Authorized Omshankar Management Console
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL TO PURGE DUMMY ACCOUNTS & DATA (User Request 2) */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-4 ring-rose-50">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-base font-black text-slate-900">
                Purge All Dummy Accounts & Portal Data?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                This will delete the 7 dummy/seed student and teacher demo accounts, sample batches, mock homeworks, mock materials, and mock fees.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-[11px] text-amber-900 space-y-1 mt-2">
                <p className="font-bold">✓ Preserves Real Accounts:</p>
                <p>Any accounts and data registered by you will remain intact. Portals will be completely clear for real school operations.</p>
                <p className="font-semibold text-slate-600 pt-1">
                  (You can always click "Reload Demo Data" if you want to restore test records later).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurgeDummyData}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Purge Dummy Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Terminate Single User */}
      {userToTerminate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-4 ring-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-black text-slate-900">Confirm Account Termination</h4>
              <p className="text-xs text-slate-600">
                Are you sure you want to terminate <strong>{userToTerminate.name}</strong> ({userToTerminate.role})?
                This completely removes their portal credentials.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToTerminate(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTerminate}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Terminate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI FORENSIC AUDIT MODAL (FOR ADMIN TAB) */}
      {viewingAiRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Payment Forensic Audit Report</span>
                    <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded">
                      Admin Inspection
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Student: <strong>{viewingAiRecord.studentName}</strong> · Month: <strong>{viewingAiRecord.month}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingAiRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div
                className={`p-4 rounded-2xl border ${
                  viewingAiRecord.isFlaggedAsProxy || viewingAiRecord.aiAnalysis?.isProxy
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : viewingAiRecord.aiAnalysis?.verdict === 'VERIFIED_GENUINE'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  {viewingAiRecord.isFlaggedAsProxy || viewingAiRecord.aiAnalysis?.isProxy ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  <h4 className="text-sm font-black uppercase tracking-wider">
                    {viewingAiRecord.isFlaggedAsProxy || viewingAiRecord.aiAnalysis?.isProxy
                      ? '🚨 PROXY FEE DETECTED (FRAUD WARNING)'
                      : viewingAiRecord.aiAnalysis?.verdict || 'GENUINE PAYMENT RECORD'}
                  </h4>
                </div>
                <p className="text-xs mt-1.5 leading-relaxed font-medium">
                  {viewingAiRecord.aiAnalysis?.forensicSummary ||
                    'Transaction reference submitted by student matches expected payment parameters.'}
                </p>
              </div>

              {/* Checklist */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Algorithmic Verification Factors Checklist:
                </h5>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>{viewingAiRecord.aiAnalysis?.factors.amountMatch.valid !== false ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">Factor 1: Fee Amount Verification</p>
                      <p className="text-[11px] text-slate-600">
                        {viewingAiRecord.aiAnalysis?.factors.amountMatch.note || `Amount ₹${viewingAiRecord.amount.toLocaleString()}.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>{viewingAiRecord.aiAnalysis?.factors.recipientMatch.valid !== false ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">Factor 2: Paid To Whom (Recipient Account)</p>
                      <p className="text-[11px] text-slate-600">
                        {viewingAiRecord.aiAnalysis?.factors.recipientMatch.note || `Recipient: ${viewingAiRecord.paidTo || 'Faculty UPI'}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>{viewingAiRecord.aiAnalysis?.factors.payerMatch.valid !== false ? '✅' : '⚠️'}</span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">Factor 3: Paid By Whom (Sender Identity)</p>
                      <p className="text-[11px] text-slate-600">
                        {viewingAiRecord.aiAnalysis?.factors.payerMatch.note || `Payer: ${viewingAiRecord.paidBy || viewingAiRecord.studentName}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>{viewingAiRecord.aiAnalysis?.factors.dateTimeMatch.valid !== false ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">Factor 4: Date & Timestamp Plausibility</p>
                      <p className="text-[11px] text-slate-600">
                        {viewingAiRecord.aiAnalysis?.factors.dateTimeMatch.note || `Logged: ${viewingAiRecord.paidAt || 'Current Cycle'}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>{viewingAiRecord.aiAnalysis?.factors.duplicateCheck.isDuplicate ? '🚨' : '✅'}</span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">Factor 5: Proxy & Duplicate Screenshot Check</p>
                      <p className="text-[11px] text-slate-600">
                        {viewingAiRecord.aiAnalysis?.factors.duplicateCheck.collisionDetails || 'No duplicate collision found.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshot Preview */}
              {viewingAiRecord.screenshotUrl && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Attached Payment Screenshot:
                  </span>
                  <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <img
                      src={viewingAiRecord.screenshotUrl}
                      alt="Student Receipt"
                      className="max-h-60 rounded-xl shadow-md border border-slate-300 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingAiRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
                {viewingAiRecord.status === 'verification_pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        verifyFeePayment(viewingAiRecord.id, false, 'Rejected by Admin Omshankar due to proxy detection.', true);
                        setViewingAiRecord(null);
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      Reject Proxy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        verifyFeePayment(viewingAiRecord.id, true);
                        setViewingAiRecord(null);
                      }}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      Approve Payment
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admin Add User (Teacher or Student) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Add New User Directly (Admin Console)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Create a teacher or student with assigned classes and credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Picker */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAddRole('teacher')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  addRole === 'teacher' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Teacher / Faculty
              </button>
              <button
                type="button"
                onClick={() => setAddRole('student')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  addRole === 'student' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Student (Grades 5–12)
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder={addRole === 'teacher' ? 'Dr. Sunita Rao' : 'Kavya Singh'}
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder={addRole === 'teacher' ? 'sunita@visionclasses.edu' : 'kavya@gmail.com'}
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="text"
                    required
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98XXX XXXXX"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              {addRole === 'teacher' ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-indigo-950">
                      Which classes and which subjects in each specific class? *
                    </label>
                    <p className="text-[11px] text-slate-600">
                      Select classes (Grades 5–12) and choose or enter the specific subject(s) taught:
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {GRADES_LIST.map((grade) => {
                        const isAssigned = !!teacherClassAssignments[grade];
                        return (
                          <button
                            type="button"
                            key={grade}
                            onClick={() => toggleTeacherGrade(grade)}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                              isAssigned
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {grade} {isAssigned ? '✓' : '+'}
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-2 pt-2">
                      {Object.keys(teacherClassAssignments).map((grade) => {
                        const activeSubjects = teacherClassAssignments[grade] || [];
                        return (
                          <div key={grade} className="p-2.5 bg-white border border-indigo-100 rounded-xl space-y-1.5">
                            <span className="text-xs font-extrabold text-indigo-900">{grade} Subjects Taught:</span>
                            <div className="flex flex-wrap gap-1">
                              {PRESET_SUBJECTS.map((sub) => {
                                const isSelected = activeSubjects.includes(sub);
                                return (
                                  <button
                                    type="button"
                                    key={sub}
                                    onClick={() => toggleTeacherSubjectInGrade(grade as GradeLevel, sub)}
                                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {sub}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty UPI ID (For Fee QR)</label>
                      <input
                        type="text"
                        placeholder="teacher@upi"
                        value={addUpiId}
                        onChange={(e) => setAddUpiId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Qualification</label>
                      <input
                        type="text"
                        placeholder="e.g. M.Sc, B.Ed 8 yrs exp"
                        value={addBio}
                        onChange={(e) => setAddBio(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Grade / Class Level *</label>
                    <select
                      value={addGrade}
                      onChange={(e) => setAddGrade(e.target.value as GradeLevel)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
                    >
                      {GRADES_LIST.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Name</label>
                      <input
                        type="text"
                        placeholder="Mr./Mrs. Singh"
                        value={addParentName}
                        onChange={(e) => setAddParentName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Phone</label>
                      <input
                        type="text"
                        placeholder="+91 98XXX XXXXX"
                        value={addParentPhone}
                        onChange={(e) => setAddParentPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll User into Vision Classes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
