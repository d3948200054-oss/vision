import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Check, 
  Save, 
  Filter,
  AlertCircle
} from 'lucide-react';

interface AttendanceTrackerProps {
  initialBatchId?: string;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ initialBatchId }) => {
  const { currentUser, batches, enrollments, users, attendanceRecords, markBatchAttendance } = useApp();

  const myBatches = batches.filter((b) => b.teacherId === currentUser?.id);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(initialBatchId || myBatches[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Active students enrolled in this batch
  const enrolledStudents = enrollments
    .filter((e) => e.batchId === selectedBatchId && e.status === 'active')
    .map((e) => users.find((u) => u.id === e.studentId))
    .filter(Boolean);

  // Local state for attendance form: studentId -> { status, remarks }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});

  useEffect(() => {
    // Check if records already exist for this date and batch
    const existing = attendanceRecords.filter((a) => a.batchId === selectedBatchId && a.date === selectedDate);
    const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};

    enrolledStudents.forEach((student) => {
      if (!student) return;
      const rec = existing.find((r) => r.studentId === student.id);
      initialMap[student.id] = {
        status: rec ? rec.status : 'present',
        remarks: rec?.remarks || '',
      };
    });

    setAttendanceMap(initialMap);
  }, [selectedBatchId, selectedDate, attendanceRecords]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    const updated = { ...attendanceMap };
    Object.keys(updated).forEach((id) => {
      updated[id] = { ...updated[id], status };
    });
    setAttendanceMap(updated);
  };

  const handleSave = () => {
    const records = Object.entries(attendanceMap).map(([studentId, data]) => {
      const student = users.find((u) => u.id === studentId);
      return {
        studentId,
        studentName: student?.name || 'Student',
        batchId: selectedBatchId,
        date: selectedDate,
        status: data.status,
        remarks: data.remarks,
      };
    });

    markBatchAttendance(records);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  // Daily stats for selected date
  const totalMarked = Object.keys(attendanceMap).length;
  const presentCount = Object.values(attendanceMap).filter((d) => d.status === 'present').length;
  const absentCount = Object.values(attendanceMap).filter((d) => d.status === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter((d) => d.status === 'late').length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Class Attendance Register
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Mark and maintain daily attendance records for every batch. Track absences and late arrivals.
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              Attendance Saved Successfully!
            </div>
          )}
        </div>

        {/* Selection bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Select Batch
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {myBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Attendance Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Quick Mark Shortcuts */}
          <div className="flex items-center gap-2 pt-4 sm:pt-0">
            <button
              onClick={() => markAll('present')}
              className="text-xs font-semibold px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              All Present
            </button>
            <button
              onClick={() => markAll('absent')}
              className="text-xs font-semibold px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
            >
              All Absent
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Register
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <p className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalMarked}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20">
          <p className="text-[10px] font-bold uppercase text-emerald-600">Present</p>
          <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{presentCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/20">
          <p className="text-[10px] font-bold uppercase text-rose-600">Absent</p>
          <p className="text-xl font-extrabold text-rose-700 mt-0.5">{absentCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20">
          <p className="text-[10px] font-bold uppercase text-amber-600">Late</p>
          <p className="text-xl font-extrabold text-amber-700 mt-0.5">{lateCount}</p>
        </div>
      </div>

      {/* Attendance Register Roster */}
      {enrolledStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No students enrolled in this batch yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Share the batch code <span className="font-mono font-bold text-indigo-600">{selectedBatch?.code}</span> with your students.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {enrolledStudents.map((student) => {
              if (!student) return null;
              const currentStatus = attendanceMap[student.id]?.status || 'present';
              const currentRemarks = attendanceMap[student.id]?.remarks || '';

              return (
                <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                      alt={student.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.studentId || 'ST-2026'} · {student.grade || 'Student'}</p>
                    </div>
                  </div>

                  {/* Status Selection Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          currentStatus === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          currentStatus === 'late'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Late
                      </button>
                    </div>

                    {/* Remarks Input */}
                    <input
                      type="text"
                      placeholder="Remarks (optional)..."
                      value={currentRemarks}
                      onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 w-44 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Complete Register
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
