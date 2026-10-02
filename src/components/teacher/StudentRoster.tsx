import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Batch } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  MessageSquare, 
  UserPlus, 
  Award, 
  Clock, 
  AlertCircle,
  Eye,
  CheckCircle2,
  X,
  Copy,
  Check
} from 'lucide-react';

interface StudentRosterProps {
  onSelectStudent: (student: User) => void;
  onDirectMessage: (studentId: string) => void;
}

export const StudentRoster: React.FC<StudentRosterProps> = ({
  onSelectStudent,
  onDirectMessage,
}) => {
  const { 
    currentUser, 
    users, 
    batches, 
    enrollments, 
    attendanceRecords, 
    testScores, 
    feeRecords,
    teacherCreateStudentForBatch 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Student creation state
  const [targetBatchId, setTargetBatchId] = useState<string>('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('pass1234');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    name: string;
    studentId: string;
    email: string;
    password: string;
    batchName: string;
  } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Batches taught by CURRENT TEACHER
  const myBatches = batches.filter((b) => b.teacherId === currentUser?.id);
  const myBatchIds = myBatches.map((b) => b.id);

  // Active enrollments for this teacher's batches
  const myEnrollments = enrollments.filter(
    (e) => myBatchIds.includes(e.batchId) && e.status === 'active'
  );

  // Unique students enrolled under this teacher
  const studentIds = Array.from(new Set(myEnrollments.map((e) => e.studentId)));
  const myStudents = users.filter((u) => studentIds.includes(u.id));

  // Filter by search & batch
  const filteredStudents = myStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.grade && student.grade.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedBatchId === 'all') return true;

    return enrollments.some(
      (e) => e.studentId === student.id && e.batchId === selectedBatchId && e.status === 'active'
    );
  });

  const handleOpenAddModal = () => {
    if (myBatches.length > 0) {
      setTargetBatchId(myBatches[0].id);
    }
    setNewStudentName('');
    const randomRoll = `ST-${Math.floor(100 + Math.random() * 900)}`;
    setNewStudentId(randomRoll);
    setNewStudentEmail('');
    setNewStudentPassword('pass1234');
    setNewStudentPhone('');
    setNewParentName('');
    setNewParentPhone('');
    setErrorMsg(null);
    setCreatedResult(null);
    setShowAddModal(true);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBatchId) {
      setErrorMsg('Please select a batch.');
      return;
    }

    const target = myBatches.find((b) => b.id === targetBatchId);
    if (!target) return;

    setErrorMsg(null);
    const result = teacherCreateStudentForBatch(targetBatchId, {
      name: newStudentName,
      studentId: newStudentId,
      email: newStudentEmail,
      password: newStudentPassword,
      phone: newStudentPhone,
      parentName: newParentName,
      parentPhone: newParentPhone,
    });

    if (result.success && result.user) {
      setCreatedResult({
        name: result.user.name,
        studentId: result.user.studentId || newStudentId,
        email: result.user.email,
        password: newStudentPassword,
        batchName: target.name,
      });
    } else {
      setErrorMsg(result.error || 'Failed to create student account.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Enrolled Students Roster
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active student accounts created by you. Click on any student to view their academic records or assign homework.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Total Students: <span className="text-blue-700 font-black">{myStudents.length}</span>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Create Student Account</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name, ID / roll no, email, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Batches ({myBatches.length})</option>
              {myBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.grade})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table / Cards */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No students currently in roster</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {myStudents.length === 0
              ? 'No student accounts have been created yet. Click "+ Create Student Account" to provision credentials for your students.'
              : 'No students matched your search criteria.'}
          </p>
          {myStudents.length === 0 && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create First Student Account
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Student ID / Roll</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Enrolled Batches</th>
                  <th className="py-3.5 px-4">Attendance</th>
                  <th className="py-3.5 px-4">Fee Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredStudents.map((student) => {
                  const studentAtt = attendanceRecords.filter(
                    (a) => a.studentId === student.id && myBatchIds.includes(a.batchId)
                  );
                  const attRate =
                    studentAtt.length > 0
                      ? Math.round(
                          (studentAtt.filter((a) => a.status === 'present').length / studentAtt.length) * 100
                        )
                      : null;

                  const studentBatches = myBatches.filter((b) =>
                    enrollments.some((e) => e.studentId === student.id && e.batchId === b.id && e.status === 'active')
                  );

                  const studentFees = feeRecords.filter(
                    (f) => f.studentId === student.id && myBatchIds.includes(f.batchId)
                  );
                  const hasOverdue = studentFees.some((f) => f.status === 'overdue');
                  const hasPending = studentFees.some((f) => f.status === 'pending');

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                      onClick={() => onSelectStudent(student)}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                            alt={student.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {student.name}
                            </p>
                            <p className="text-[11px] text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {student.studentId || '—'}
                        </span>
                      </td>

                      {/* Grade */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">
                          {student.grade || 'Class 10'}
                        </span>
                      </td>

                      {/* Batches */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {studentBatches.map((b) => (
                            <span
                              key={b.id}
                              className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg"
                            >
                              {b.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Attendance */}
                      <td className="py-3.5 px-4">
                        {attRate !== null ? (
                          <span
                            className={`font-bold ${
                              attRate >= 80
                                ? 'text-emerald-700'
                                : attRate >= 60
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {attRate}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No classes yet</span>
                        )}
                      </td>

                      {/* Fee Status */}
                      <td className="py-3.5 px-4">
                        {hasOverdue ? (
                          <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-bold">
                            Overdue
                          </span>
                        ) : hasPending ? (
                          <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
                            Pending
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                            Clear
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDirectMessage(student.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Send Message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Teacher Action
                </span>
                <h3 className="text-base font-black text-white">Create Student Account</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdResult ? (
              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-1">
                  <p className="font-black text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Student Account Activated!
                  </p>
                  <p className="text-slate-600">
                    The student has been enrolled into <strong>{createdResult.batchName}</strong>. Provide these login details to the student.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Name:</span>
                    <strong className="text-slate-900">{createdResult.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Student ID:</span>
                    <strong className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {createdResult.studentId}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Email:</span>
                    <strong className="text-slate-900">{createdResult.email}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Password:</span>
                    <strong className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {createdResult.password}
                    </strong>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const text = `Vision Classes Student Credentials:\nStudent Name: ${createdResult.name}\nStudent ID: ${createdResult.studentId}\nEmail: ${createdResult.email}\nPassword: ${createdResult.password}\nBatch: ${createdResult.batchName}`;
                      navigator.clipboard.writeText(text);
                      setCopiedCreds(true);
                      setTimeout(() => setCopiedCreds(false), 2000);
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copiedCreds ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCreds ? 'Copied to Clipboard!' : 'Copy Login Details'}</span>
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateStudent} className="p-6 space-y-3.5 text-xs">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block font-black text-slate-700 mb-1">Enrolling Batch *</label>
                  <select
                    value={targetBatchId}
                    onChange={(e) => setTargetBatchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  >
                    {myBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.grade}, Joining: {b.joiningMonth || 'October 2026'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Gupta"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Student ID / Roll No *</label>
                    <input
                      type="text"
                      required
                      value={newStudentId}
                      onChange={(e) => setNewStudentId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Initial Password *</label>
                    <input
                      type="text"
                      required
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
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
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Student Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98XXX XXXXX"
                      value={newStudentPhone}
                      onChange={(e) => setNewStudentPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
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
    </div>
  );
};
