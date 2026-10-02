import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeLevel, Batch } from '../../types';
import { 
  Users, 
  Plus, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  DollarSign, 
  BookOpen, 
  CheckCircle2,
  UserPlus,
  X,
  ShieldCheck,
  AlertCircle,
  Edit2,
  KeyRound,
  FileCheck
} from 'lucide-react';

const GRADES: GradeLevel[] = [
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

const QUICK_JOINING_MONTHS = [
  'October 2026',
  'November 2026',
  'December 2026',
  'January 2027',
  'April 2027',
  'July 2027',
];

interface BatchManagerProps {
  onSelectBatchForAttendance: (batchId: string) => void;
  onSelectBatchForHomework: (batchId: string) => void;
}

export const BatchManager: React.FC<BatchManagerProps> = ({
  onSelectBatchForAttendance,
  onSelectBatchForHomework,
}) => {
  const { 
    currentUser, 
    batches, 
    enrollments, 
    createBatch, 
    updateBatch, 
    updateBatchFeeAndMonth, 
    teacherCreateStudentForBatch 
  } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Quick Fee & Month Decision Modal
  const [quickEditBatch, setQuickEditBatch] = useState<Batch | null>(null);
  const [quickFeeInput, setQuickFeeInput] = useState('');
  const [quickMonthInput, setQuickMonthInput] = useState('');
  const [quickSuccessMsg, setQuickSuccessMsg] = useState<string | null>(null);

  // Teacher Provisions Student Modal
  const [provisioningBatch, setProvisioningBatch] = useState<Batch | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('student123');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentCustomFee, setStudentCustomFee] = useState('');
  const [studentCustomMonth, setStudentCustomMonth] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [createdStudentResult, setCreatedStudentResult] = useState<{
    name: string;
    studentId: string;
    email: string;
    password: string;
    batchName: string;
    joiningMonth: string;
  } | null>(null);
  const [provisionErrorMsg, setProvisionErrorMsg] = useState<string | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Form states for creating/editing batch
  const [bName, setBName] = useState('');
  const [bGrade, setBGrade] = useState<GradeLevel>('Class 10');
  const [bSubject, setBSubject] = useState('Mathematics & Physics');
  const [bJoiningMonth, setBJoiningMonth] = useState('October 2026');
  const [bCode, setBCode] = useState('');
  const [bSchedule, setBSchedule] = useState('Mon, Wed, Fri · 5:00 PM – 6:30 PM');
  const [bRoom, setBRoom] = useState('Room 101 / Smart Classroom');
  const [bMonthlyFee, setBMonthlyFee] = useState('2800');
  const [bDueDateDay, setBDueDateDay] = useState('5');
  const [bDescription, setBDescription] = useState('Board exam booster batch with intensive concept building, mock tests, and numerical problem solving.');

  // Filter batches strictly for current logged in teacher
  const teacherBatches = batches.filter((b) => b.teacherId === currentUser?.id);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGradeChange = (newGrade: GradeLevel) => {
    setBGrade(newGrade);
    const num = newGrade.replace('Class ', '');
    setBCode(`VC-${num}-${bSubject.slice(0, 3).toUpperCase()}`);
  };

  const openCreateModal = () => {
    setEditingBatch(null);
    setBName('Class 10 - Mathematics & Physics Board Booster');
    setBGrade('Class 10');
    setBSubject('Mathematics & Physics');
    setBJoiningMonth('October 2026');
    setBCode(`VC-10-MATH`);
    setBSchedule('Mon, Wed, Fri · 5:00 PM – 6:30 PM');
    setBRoom('Room 101 / Main Campus');
    setBMonthlyFee('2800');
    setBDueDateDay('5');
    setBDescription('Intensive curriculum covering NCERT theory, board exam numericals, and mock assessments.');
    setShowCreateModal(true);
  };

  const openEditModal = (batch: Batch) => {
    setEditingBatch(batch);
    setBName(batch.name);
    setBGrade(batch.grade);
    setBSubject(batch.subjectsList?.join(' & ') || batch.subject);
    setBJoiningMonth(batch.joiningMonth || 'October 2026');
    setBCode(batch.code);
    setBSchedule(batch.schedule);
    setBRoom(batch.roomOrPlatform || 'Room 101');
    setBMonthlyFee(batch.monthlyFee.toString());
    setBDueDateDay(batch.feeDueDateDay.toString());
    setBDescription(batch.description || '');
    setShowCreateModal(true);
  };

  const handleSubmitBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedCode = bCode.trim().toUpperCase() || `VC-${bGrade.replace('Class ', '')}-${Date.now().toString().slice(-4)}`;

    const subjectsArr = bSubject
      .split(/[,&/]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingBatch) {
      updateBatch(editingBatch.id, {
        name: bName.trim(),
        code: generatedCode,
        grade: bGrade,
        subject: bSubject.trim(),
        subjectsList: subjectsArr.length > 0 ? subjectsArr : [bSubject.trim()],
        joiningMonth: bJoiningMonth.trim() || 'October 2026',
        schedule: bSchedule,
        roomOrPlatform: bRoom,
        monthlyFee: parseFloat(bMonthlyFee) || 2500,
        feeDueDateDay: parseInt(bDueDateDay, 10) || 5,
        description: bDescription,
      });
    } else {
      createBatch({
        name: bName.trim(),
        code: generatedCode,
        grade: bGrade,
        subject: bSubject.trim(),
        subjectsList: subjectsArr.length > 0 ? subjectsArr : [bSubject.trim()],
        joiningMonth: bJoiningMonth.trim() || 'October 2026',
        schedule: bSchedule,
        roomOrPlatform: bRoom,
        monthlyFee: parseFloat(bMonthlyFee) || 2500,
        feeDueDateDay: parseInt(bDueDateDay, 10) || 5,
        description: bDescription,
        maxStudents: 35,
      });
    }

    setShowCreateModal(false);
    setEditingBatch(null);
  };

  const handleOpenProvisionModal = (batch: Batch) => {
    setProvisioningBatch(batch);
    setCreatedStudentResult(null);
    setProvisionErrorMsg(null);
    setStudentName('');
    const randomId = `ST-${Math.floor(100 + Math.random() * 900)}`;
    setStudentIdInput(randomId);
    setStudentEmail('');
    setStudentPassword('pass1234');
    setStudentPhone('');
    setStudentCustomFee(batch.monthlyFee.toString());
    setStudentCustomMonth(batch.joiningMonth || 'October 2026');
    setParentName('');
    setParentPhone('');
  };

  const handleOpenQuickFeeModal = (batch: Batch) => {
    setQuickEditBatch(batch);
    setQuickFeeInput(batch.monthlyFee.toString());
    setQuickMonthInput(batch.joiningMonth || 'October 2026');
    setQuickSuccessMsg(null);
  };

  const handleSaveQuickFeeAndMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditBatch) return;

    const feeNum = Number(quickFeeInput);
    if (isNaN(feeNum) || feeNum <= 0) return;

    updateBatchFeeAndMonth(quickEditBatch.id, feeNum, quickMonthInput.trim() || 'October 2026');
    setQuickSuccessMsg(`Decided Fee: ₹${feeNum.toLocaleString()}/mo & Joining: ${quickMonthInput} updated! Visible on student registration.`);
    setTimeout(() => {
      setQuickEditBatch(null);
      setQuickSuccessMsg(null);
    }, 1400);
  };

  const handleProvisionStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisioningBatch) return;

    setProvisionErrorMsg(null);

    const result = teacherCreateStudentForBatch(provisioningBatch.id, {
      name: studentName,
      studentId: studentIdInput,
      email: studentEmail,
      password: studentPassword,
      phone: studentPhone,
      parentName,
      parentPhone,
      monthlyFee: Number(studentCustomFee) || provisioningBatch.monthlyFee,
      joiningMonth: studentCustomMonth || provisioningBatch.joiningMonth || 'October 2026',
    });

    if (result.success && result.user) {
      setCreatedStudentResult({
        name: result.user.name,
        studentId: result.user.studentId || studentIdInput,
        email: result.user.email,
        password: studentPassword,
        batchName: provisioningBatch.name,
        joiningMonth: studentCustomMonth || provisioningBatch.joiningMonth || 'October 2026',
      });
    } else {
      setProvisionErrorMsg(result.error || 'Failed to create student account.');
    }
  };

  const copyStudentCredentials = () => {
    if (!createdStudentResult) return;
    const text = `Vision Classes Student Credentials:\nStudent Name: ${createdStudentResult.name}\nStudent ID: ${createdStudentResult.studentId}\nEmail: ${createdStudentResult.email}\nPassword: ${createdStudentResult.password}\nEnrolled Batch: ${createdStudentResult.batchName}\nJoining Month: ${createdStudentResult.joiningMonth}`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Your Coaching Batches & Classes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure your curriculum batches (Class, Subject/Subjects, Joining Batch Month, and Fee). Create student accounts directly to give students access to your batches.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Class Batch
        </button>
      </div>

      {/* Batches Grid */}
      {teacherBatches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-2">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No batches created yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Create New Class Batch" to define your class, subject/subjects, and joining batch month.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherBatches.map((batch) => {
            const batchEnrolledCount = enrollments.filter(
              (e) => e.batchId === batch.id && e.status === 'active'
            ).length;

            const displaySubjects = batch.subjectsList && batch.subjectsList.length > 0 
              ? batch.subjectsList.join(' · ') 
              : batch.subject;

            return (
              <div
                key={batch.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg">
                      {batch.grade}
                    </span>

                    {/* Joining Batch Month Badge */}
                    <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      Joining: {batch.joiningMonth || 'October 2026'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {batch.name}
                      </h3>
                      <button
                        onClick={() => openEditModal(batch)}
                        className="text-slate-400 hover:text-blue-600 p-1 transition-colors"
                        title="Edit Batch Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {batch.description}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <p className="text-slate-800 font-bold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      Subjects: <span className="text-blue-950 font-black">{displaySubjects}</span>
                    </p>
                    <p className="text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{batch.schedule}</span>
                    </p>
                    <div className="pt-1 border-t border-slate-200/70 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Decided Fee:</span>
                      <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        ₹{batch.monthlyFee.toLocaleString()} / month
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      ✓ Visible on student registration
                    </p>
                  </div>

                  {/* Joining Code */}
                  <div className="flex items-center justify-between bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-xs font-mono font-bold text-blue-900">
                      Code: {batch.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(batch.code)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      {copiedCode === batch.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedCode === batch.code ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                {/* Card Actions: Quick Fee Update & Create Student Account */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenQuickFeeModal(batch)}
                      className="flex-1 py-2 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      title="Decide or change monthly fee and joining session month"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                      <span>Set Fee (₹{batch.monthlyFee.toLocaleString()}) & Month</span>
                    </button>
                    <button
                      onClick={() => openEditModal(batch)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                      Edit
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenProvisionModal(batch)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <UserPlus className="w-4 h-4 text-blue-200" />
                    <span>+ Create Student Account & Enroll</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                    <span>Enrolled: <strong>{batchEnrolledCount}</strong> students</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectBatchForAttendance(batch.id)}
                        className="text-blue-700 font-bold hover:underline"
                      >
                        Attendance
                      </button>
                      <span>·</span>
                      <button
                        onClick={() => onSelectBatchForHomework(batch.id)}
                        className="text-blue-700 font-bold hover:underline"
                      >
                        Homework
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT BATCH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-black">
                  {editingBatch ? 'Edit Batch Details' : 'Create Coaching Batch'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingBatch(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBatch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1">Batch Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 - Mathematics Board Booster"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* CLASS / GRADE */}
                <div>
                  <label className="block font-black text-slate-700 mb-1">Class / Grade Level *</label>
                  <select
                    value={bGrade}
                    onChange={(e) => handleGradeChange(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* JOINING BATCH MONTH */}
                <div>
                  <label className="block font-black text-slate-700 mb-1">Joining Batch Month *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 2026"
                    value={bJoiningMonth}
                    onChange={(e) => setBJoiningMonth(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Quick Joining Month Suggestions */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Quick Select Joining Month:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_JOINING_MONTHS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBJoiningMonth(m)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        bJoiningMonth === m
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* SUBJECT / SUBJECTS */}
              <div>
                <label className="block font-black text-slate-700 mb-1">Subject / Subjects *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics & Physics or Science Foundation"
                  value={bSubject}
                  onChange={(e) => setBSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  You can specify multiple subjects separated by "&" or "," (e.g. Mathematics, Physics, Chemistry).
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">Monthly Tuition Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    min="500"
                    step="100"
                    placeholder="2500"
                    value={bMonthlyFee}
                    onChange={(e) => setBMonthlyFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">Fee Due Day of Month *</label>
                  <select
                    value={bDueDateDay}
                    onChange={(e) => setBDueDateDay(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="1">1st of each month</option>
                    <option value="5">5th of each month</option>
                    <option value="7">7th of each month</option>
                    <option value="10">10th of each month</option>
                    <option value="15">15th of each month</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Weekly Class Schedule *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mon, Wed, Fri · 5:00 PM – 6:30 PM"
                  value={bSchedule}
                  onChange={(e) => setBSchedule(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Batch Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of syllabus and learning objectives..."
                  value={bDescription}
                  onChange={(e) => setBDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
                >
                  {editingBatch ? 'Save Batch Changes' : 'Publish New Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER PROVISIONS STUDENT MODAL */}
      {provisioningBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Teacher Action · Create Student Account
                </span>
                <h3 className="text-base font-black text-white">{provisioningBatch.name}</h3>
              </div>
              <button
                onClick={() => {
                  setProvisioningBatch(null);
                  setCreatedStudentResult(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdStudentResult ? (
              /* Confirmation Screen with Copyable Credentials */
              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Student Account Created & Activated!</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    The student can now log into the application using either their <strong>Student ID</strong> or <strong>Email</strong> with the password below.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Student Name:</span>
                    <span className="font-bold text-slate-900">{createdStudentResult.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Student ID / Roll No:</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {createdStudentResult.studentId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Login Email:</span>
                    <span className="font-bold text-slate-900">{createdStudentResult.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Password:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {createdStudentResult.password}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Batch:</span>
                    <span className="font-bold text-slate-900 font-sans">{createdStudentResult.batchName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Joining Month:</span>
                    <span className="font-bold text-slate-900 font-sans">{createdStudentResult.joiningMonth}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyStudentCredentials}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copiedCreds ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCreds ? 'Credentials Copied to Clipboard!' : 'Copy Credentials for Student'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setProvisioningBatch(null);
                      setCreatedStudentResult(null);
                    }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Input Form */
              <form onSubmit={handleProvisionStudent} className="p-6 space-y-3.5 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900">
                  <strong>Create Student Account:</strong> As the batch teacher, create the student's account details. The student will use these credentials to log in.
                </div>

                {provisionErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{provisionErrorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block font-black text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Patel or Sneha Sen"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Student ID / Roll No *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ST-101"
                      value={studentIdInput}
                      onChange={(e) => setStudentIdInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Initial Password *</label>
                    <input
                      type="text"
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Student Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Student Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98XXX XXXXX"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Student Monthly Fee (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        required
                        value={studentCustomFee}
                        onChange={(e) => setStudentCustomFee(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Joining Session Month *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentCustomMonth}
                      onChange={(e) => setStudentCustomMonth(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Parent Name</label>
                    <input
                      type="text"
                      placeholder="Parent / Guardian"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Parent Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98XXX XXXXX"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create & Activate Student Account</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QUICK SET BATCH FEE & JOINING MONTH MODAL (Decided by teacher in dashboard) */}
      {quickEditBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black">
                  Decide Batch Fee & Joining Month
                </h3>
              </div>
              <button
                onClick={() => setQuickEditBatch(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickFeeAndMonth} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                <strong>Batch:</strong> <span className="font-bold">{quickEditBatch.name}</span> ({quickEditBatch.grade}).
                Changes decided here are updated immediately and will be visible to students during registration.
              </div>

              {quickSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{quickSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Monthly Tuition Fee (₹) · Decided by Teacher *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min="500"
                    step="50"
                    placeholder="e.g. 2800"
                    value={quickFeeInput}
                    onChange={(e) => setQuickFeeInput(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-blue-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Tuition fee charged per student each month for this batch.
                </p>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Joining Session Month · Decided by Teacher *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October 2026 or November 2026"
                  value={quickMonthInput}
                  onChange={(e) => setQuickMonthInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_JOINING_MONTHS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setQuickMonthInput(m)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        quickMonthInput === m
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
                >
                  Save Decided Fee & Session Month
                </button>
                <button
                  type="button"
                  onClick={() => setQuickEditBatch(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
