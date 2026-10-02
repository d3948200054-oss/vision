import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeLevel, UserRole, Batch } from '../../types';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Key, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  BookOpen,
  Calendar,
  Search,
  DollarSign,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  preselectedBatchId?: string;
  initialStudentTab?: 'signin' | 'register' | 'lookup';
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

const JOINING_MONTHS_OPTIONS = [
  'October 2026',
  'November 2026',
  'December 2026',
  'January 2027',
  'April 2027',
  'July 2027',
];

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultRole = 'teacher',
  preselectedBatchId,
  initialStudentTab = 'signin',
}) => {
  const { 
    login, 
    registerTeacher, 
    registerStudentForBatch, 
    batches, 
    lookupStudentAccount 
  } = useApp();

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [studentTab, setStudentTab] = useState<'signin' | 'register' | 'lookup'>(initialStudentTab);
  const [teacherMode, setTeacherMode] = useState<'login' | 'register'>('login');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Common Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Student ID
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Student Lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    student?: any;
    enrolledBatches?: Batch[];
    message?: string;
  } | null>(null);

  // Student Registration state (visible batches created by teachers)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regGrade, setRegGrade] = useState<GradeLevel>('Class 10');
  const [regParentName, setRegParentName] = useState('');
  const [regParentPhone, setRegParentPhone] = useState('');
  const [regBatchId, setRegBatchId] = useState<string>(preselectedBatchId || (batches[0]?.id || ''));

  // Teacher Registration state WITH teacher-decided Batch Fee & Joining Session Month
  const [tName, setTName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPassword, setTPassword] = useState('');
  const [tConfirmPassword, setTConfirmPassword] = useState('');
  const [showTPassword, setShowTPassword] = useState(false);
  const [showTConfirmPassword, setShowTConfirmPassword] = useState(false);
  const [tKey, setTKey] = useState('VISION-FACULTY-2026');
  const [tPhone, setTPhone] = useState('');
  const [tUpiId, setTUpiId] = useState('');
  const [tBio, setTBio] = useState('');
  const [tSubject, setTSubject] = useState('Mathematics & Physics');

  // Teacher-decided batch specifics on registration:
  const [tBatchGrade, setTBatchGrade] = useState<GradeLevel>('Class 10');
  const [tBatchName, setTBatchName] = useState('Class 10 - Mathematics & Physics Board Excellence');
  const [tMonthlyFee, setTMonthlyFee] = useState('2800');
  const [tJoiningMonth, setTJoiningMonth] = useState('October 2026');
  const [tCustomJoiningMonth, setTCustomJoiningMonth] = useState('');
  const [tSchedule, setTSchedule] = useState('Mon, Wed, Fri · 5:00 PM – 6:30 PM');

  useEffect(() => {
    if (preselectedBatchId) {
      setRegBatchId(preselectedBatchId);
      setRole('student');
      setStudentTab('register');
    }
  }, [preselectedBatchId]);

  if (!isOpen) return null;

  const targetBatch = batches.find((b) => b.id === regBatchId) || batches.find((b) => b.active) || batches[0];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const res = login(loginIdentifier, loginPassword, role);
    if (res.success) {
      setSuccessMsg('Signed in successfully! Redirecting...');
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setError(res.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = lookupStudentAccount(lookupQuery);
    setLookupResult(result);
    if (!result.found && result.message) {
      setError(result.message);
    }
  };

  const handleStudentRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!targetBatch) {
      setError('Please select an active batch created by a teacher.');
      return;
    }

    if (!regPassword || regPassword.trim().length < 6) {
      setError('Please create a password with at least 6 characters for your student account.');
      return;
    }

    const res = registerStudentForBatch({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      grade: regGrade,
      batchId: targetBatch.id,
      parentName: regParentName,
      parentPhone: regParentPhone,
    });

    if (res.success) {
      setSuccessMsg(
        res.message || `Registration submitted for ${targetBatch.name}! Monthly Fee: ₹${targetBatch.monthlyFee.toLocaleString()}/mo · Joining: ${targetBatch.joiningMonth || 'October 2026'}.`
      );
      setTimeout(() => {
        onClose();
      }, 2500);
    } else {
      setError(res.error || 'Registration failed. Please check your information.');
    }
  };

  const handleTeacherRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (tPassword !== tConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const chosenMonth = tJoiningMonth === 'custom' ? tCustomJoiningMonth.trim() : tJoiningMonth;
    if (!chosenMonth) {
      setError('Please provide a valid joining session month for your batch.');
      return;
    }

    const feeNum = Number(tMonthlyFee);
    if (isNaN(feeNum) || feeNum <= 0) {
      setError('Please specify a valid monthly tuition fee in INR (₹).');
      return;
    }

    const subjectsArr = tSubject.split(/[,&/]+/).map((s) => s.trim()).filter(Boolean);

    const res = registerTeacher({
      name: tName,
      email: tEmail,
      password: tPassword,
      verificationKey: tKey,
      subjects: subjectsArr.length > 0 ? subjectsArr : ['Mathematics'],
      classSubjectAssignments: [
        { grade: tBatchGrade, subject: tSubject },
      ],
      phone: tPhone,
      bio: tBio,
      upiId: tUpiId,
      // Teacher decides initial batch fee and joining session month on account creation:
      initialBatch: {
        name: tBatchName.trim() || `${tBatchGrade} - ${tSubject} Batch`,
        grade: tBatchGrade,
        subject: tSubject,
        monthlyFee: feeNum,
        joiningMonth: chosenMonth,
        feeDueDateDay: 5,
        schedule: tSchedule,
        description: `Class curriculum taught by ${tName}. Monthly fee decided by teacher: ₹${feeNum}/mo. Joining Session: ${chosenMonth}.`,
      }
    });

    if (res.success) {
      setSuccessMsg(
        `Faculty account registered! Your initial batch "${tBatchName}" with fee ₹${feeNum.toLocaleString()}/mo and joining month ${chosenMonth} is now active and visible on student registration.`
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(res.error || 'Failed to register faculty account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Vision Classes Portal</h3>
              <p className="text-xs text-blue-200">
                {role === 'teacher' ? 'Faculty Portal' : 'Student Portal'} · Portal Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-xl transition-all ${
                role === 'teacher'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Teacher / Faculty
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-xl transition-all ${
                role === 'student'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              Student (Grades 5–12)
            </button>
          </div>

          {/* Sub-Tabs for Student */}
          {role === 'student' ? (
            <div className="flex items-center justify-around border-b border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setStudentTab('signin');
                  setError(null);
                }}
                className={`py-2 px-3 border-b-2 transition-all ${
                  studentTab === 'signin'
                    ? 'border-blue-600 text-blue-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In (Teacher Created)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudentTab('register');
                  setError(null);
                }}
                className={`py-2 px-3 border-b-2 transition-all ${
                  studentTab === 'register'
                    ? 'border-blue-600 text-blue-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Student Registration & Batches
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudentTab('lookup');
                  setError(null);
                }}
                className={`py-2 px-3 border-b-2 transition-all ${
                  studentTab === 'lookup'
                    ? 'border-blue-600 text-blue-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Check Enrollment
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between border-b border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTeacherMode('login');
                  setError(null);
                }}
                className={`py-2 px-4 border-b-2 transition-all ${
                  teacherMode === 'login'
                    ? 'border-blue-600 text-blue-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Teacher Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeacherMode('register');
                  setError(null);
                }}
                className={`py-2 px-4 border-b-2 transition-all ${
                  teacherMode === 'register'
                    ? 'border-blue-600 text-blue-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Teacher Account Creation (Decide Fee & Month)
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STUDENT SECTION */}
          {role === 'student' && (
            <>
              {studentTab === 'signin' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                    <strong>Student Account Access:</strong> In Vision Classes, student accounts are created by your teacher. If your instructor has created your account, sign in with your <strong>Student ID</strong> or registered email.
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Student ID or Registered Email *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. ST-2026-01 or student@example.com"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      />
                      <User className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your student password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Sign In to Student Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-1 text-slate-500">
                    <span>Don't have an account yet? </span>
                    <button
                      type="button"
                      onClick={() => setStudentTab('register')}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Register for a Teacher's Batch →
                    </button>
                  </div>
                </form>
              )}

              {/* STUDENT REGISTRATION TAB - VISIBLE BATCHES WITH TEACHER DECIDED FEE & JOINING MONTH */}
              {studentTab === 'register' && (
                <form onSubmit={handleStudentRegistrationSubmit} className="space-y-3.5 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                    <strong>Student Registration:</strong> Select a batch created by a teacher. You will see the exact monthly fee and joining session month decided by the teacher.
                  </div>

                  {/* TARGET BATCH SELECTOR (Shows image match + teacher fee & joining month) */}
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Target Batch * <span className="font-normal text-slate-500">(Created by Teacher)</span>
                    </label>
                    <select
                      value={regBatchId}
                      onChange={(e) => setRegBatchId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                    >
                      {batches.filter((b) => b.active).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.grade} · {b.subjectsList?.join(' & ') || b.subject} (Joining: {b.joiningMonth || 'October 2026'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* VISIBLE BATCH DETAILS DECIDED BY TEACHER */}
                  {targetBatch && (
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border-2 border-blue-200 shadow-xs space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                            {targetBatch.grade}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 mt-1">{targetBatch.name}</h4>
                        </div>
                        {/* TEACHER DECIDED FEE BADGE */}
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Decided Fee</span>
                          <span className="text-sm font-black text-blue-700">
                            ₹{targetBatch.monthlyFee.toLocaleString()}/mo
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Instructor: <strong className="text-slate-900">{targetBatch.teacherName}</strong></span>
                        </div>
                        {/* JOINING SESSION MONTH */}
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Joining: {targetBatch.joiningMonth || 'October 2026'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {targetBatch.schedule}
                        </span>
                        <span className="text-slate-500">
                          Due Date: <strong>{targetBatch.feeDueDateDay}th</strong> of month
                        </span>
                      </div>
                    </div>
                  )}

                  {/* STUDENT REGISTRATION INPUTS */}
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Patel"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black text-slate-700 mb-1">Student Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="student@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98XXX XXXXX"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black text-slate-700 mb-1">Account Password *</label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 6 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1">Class / Grade *</label>
                      <select
                        value={regGrade}
                        onChange={(e) => setRegGrade(e.target.value as GradeLevel)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        {GRADES_LIST.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black text-slate-700 mb-1">Parent / Guardian Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Patel"
                        value={regParentName}
                        onChange={(e) => setRegParentName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1">Parent Phone</label>
                      <input
                        type="tel"
                        placeholder="+91 98XXX XXXXX"
                        value={regParentPhone}
                        onChange={(e) => setRegParentPhone(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Register for {targetBatch?.name || 'Selected Batch'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {studentTab === 'lookup' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900">
                    <strong>Check Status:</strong> Enter your Student ID / Roll Number or Email to check if your teacher has created your account or approved your batch admission.
                  </div>

                  <form onSubmit={handleLookupSubmit} className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Enter Student ID (e.g. ST-2026-01) or Email"
                        value={lookupQuery}
                        onChange={(e) => setLookupQuery(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Search Enrollment Status
                    </button>
                  </form>

                  {lookupResult && lookupResult.found && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Student Record Verified!</span>
                      </div>
                      <div className="text-xs space-y-1 text-slate-700">
                        <p><strong>Name:</strong> {lookupResult.student?.name}</p>
                        <p><strong>Student ID:</strong> <span className="font-mono font-bold text-blue-700">{lookupResult.student?.studentId}</span></p>
                        <p><strong>Email:</strong> {lookupResult.student?.email}</p>
                      </div>

                      {lookupResult.enrolledBatches && lookupResult.enrolledBatches.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Enrolled Batches:</span>
                          {lookupResult.enrolledBatches.map((b) => (
                            <div key={b.id} className="bg-white p-2.5 rounded-xl border border-emerald-200 text-xs">
                              <p className="font-black text-slate-900">{b.name}</p>
                              <p className="text-[11px] text-slate-500">
                                Subjects: {b.subjectsList?.join(' · ') || b.subject} · Joining: {b.joiningMonth || 'October 2026'} · Fee: ₹{b.monthlyFee.toLocaleString()}/mo
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier(lookupResult.student?.studentId || lookupResult.student?.email || '');
                          setStudentTab('signin');
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all"
                      >
                        Proceed to Sign In with this Account →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* TEACHER SECTION */}
          {role === 'teacher' && (
            <>
              {teacherMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                    <strong>Faculty Portal:</strong> Sign in with your registered instructor email to create and manage batches, set monthly fees, enroll students, and inspect payment screenshots.
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 mb-1">Faculty Official Email *</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="e.g. rajesh.sharma@visionclasses.edu"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      />
                      <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Sign In to Faculty Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-1 text-slate-500">
                    <span>New faculty member? </span>
                    <button
                      type="button"
                      onClick={() => setTeacherMode('register')}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Create Teacher Account & Set Batch Fee →
                    </button>
                  </div>
                </form>
              ) : (
                /* TEACHER REGISTRATION FORM: DECIDE FEE & JOINING MONTH ON ACCOUNT CREATION */
                <form onSubmit={handleTeacherRegisterSubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900">
                    <strong>Teacher Account Creation:</strong> Set up your faculty account. On account creation, you will <strong>decide the monthly fee and joining session month</strong> for your initial batch. This batch will be immediately visible on student registration.
                  </div>

                  {/* 1. TEACHER PERSONAL CREDENTIALS */}
                  <div className="space-y-3">
                    <div>
                      <label className="block font-black text-slate-700 mb-1">Full Name & Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Rajesh Sharma or Mrs. Priya Sen"
                        value={tName}
                        onChange={(e) => setTName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-black text-slate-700 mb-1">Official Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="teacher@visionclasses.edu"
                          value={tEmail}
                          onChange={(e) => setTEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-black text-slate-700 mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          placeholder="+91 98XXX XXXXX"
                          value={tPhone}
                          onChange={(e) => setTPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-black text-slate-700 mb-1">
                        Faculty Verification Authorization Key *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VISION-FACULTY-2026"
                        value={tKey}
                        onChange={(e) => setTKey(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-black text-slate-700 mb-1">Password *</label>
                        <input
                          type={showTPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 6 chars"
                          value={tPassword}
                          onChange={(e) => setTPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-black text-slate-700 mb-1">Confirm Password *</label>
                        <input
                          type={showTConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-enter password"
                          value={tConfirmPassword}
                          onChange={(e) => setTConfirmPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. CORE USER REQUIREMENT: TEACHER DECIDES FEE & JOINING MONTH ON ACCOUNT CREATION */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/40 rounded-2xl border-2 border-blue-200 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        ₹
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          Decide Batch Fee & Joining Session Month *
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          Set the fee and session details for your teaching batch. This will be visible on student registration.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-black text-slate-700 mb-1">Class / Grade *</label>
                        <select
                          value={tBatchGrade}
                          onChange={(e) => {
                            const newG = e.target.value as GradeLevel;
                            setTBatchGrade(newG);
                            setTBatchName(`${newG} - ${tSubject} Batch`);
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        >
                          {GRADES_LIST.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      {/* TEACHER DECIDED MONTHLY FEE */}
                      <div>
                        <label className="block font-black text-slate-700 mb-1">
                          Monthly Tuition Fee (₹) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            required
                            min="500"
                            step="100"
                            placeholder="e.g. 2800"
                            value={tMonthlyFee}
                            onChange={(e) => setTMonthlyFee(e.target.value)}
                            className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-blue-300 rounded-xl text-xs font-black text-blue-900 focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* TEACHER DECIDED JOINING SESSION MONTH */}
                      <div>
                        <label className="block font-black text-slate-700 mb-1">
                          Joining Session Month *
                        </label>
                        <select
                          value={tJoiningMonth}
                          onChange={(e) => setTJoiningMonth(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-950"
                        >
                          {JOINING_MONTHS_OPTIONS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                          <option value="custom">+ Custom Month...</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-black text-slate-700 mb-1">Primary Subjects Taught *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mathematics & Physics"
                          value={tSubject}
                          onChange={(e) => {
                            setTSubject(e.target.value);
                            setTBatchName(`${tBatchGrade} - ${e.target.value}`);
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    {tJoiningMonth === 'custom' && (
                      <div>
                        <label className="block font-black text-slate-700 mb-1">Specify Custom Joining Month *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. May 2027 or August 2026"
                          value={tCustomJoiningMonth}
                          onChange={(e) => setTCustomJoiningMonth(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-black text-slate-700 mb-1">Batch Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Class 10 - Mathematics Board Excellence"
                        value={tBatchName}
                        onChange={(e) => setTBatchName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-black text-slate-700 mb-1">Weekly Schedule</label>
                      <input
                        type="text"
                        placeholder="e.g. Mon, Wed, Fri · 5:00 PM – 6:30 PM"
                        value={tSchedule}
                        onChange={(e) => setTSchedule(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/25 transition-all active:scale-95"
                  >
                    Register Teacher Account & Create Batch (₹{tMonthlyFee}/mo)
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
