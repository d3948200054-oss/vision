import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DayOfWeek, TimetableSlot, Batch } from '../../types';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  BookOpen, 
  CheckCircle, 
  Sparkles, 
  Filter, 
  AlertCircle,
  GraduationCap,
  MapPin,
  HelpCircle,
  Check
} from 'lucide-react';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface BatchTimetableProps {
  mode: 'teacher' | 'student';
}

export const BatchTimetable: React.FC<BatchTimetableProps> = ({ mode }) => {
  const {
    currentUser,
    batches,
    enrollments,
    timetableSlots,
    addTimetableSlot,
    deleteTimetableSlot,
  } = useApp();

  // Determine current day of week
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;

  // Teacher specific: batches taught by currentUser
  const teacherBatches = batches.filter((b) => b.teacherId === currentUser?.id);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(teacherBatches[0]?.id || 'all');

  // Student specific: active batches student is enrolled in
  const studentEnrollments = enrollments.filter(
    (e) => e.studentId === currentUser?.id && e.status === 'active'
  );
  const studentBatchIds = studentEnrollments.map((e) => e.batchId);
  const studentBatches = batches.filter((b) => studentBatchIds.includes(b.id));

  // Day filter
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');

  // Add slot modal state (for teachers)
  const [showAddModal, setShowAddModal] = useState(false);
  const [slotDay, setSlotDay] = useState<DayOfWeek>('Monday');
  const [slotStartTime, setSlotStartTime] = useState('05:00 PM');
  const [slotEndTime, setSlotEndTime] = useState('06:30 PM');
  const [slotSubject, setSlotSubject] = useState('Mathematics');
  const [slotTopic, setSlotTopic] = useState('');
  const [slotRoom, setSlotRoom] = useState('Room 101');
  const [slotIsSpecial, setSlotIsSpecial] = useState(false);
  const [targetBatchId, setTargetBatchId] = useState<string>(teacherBatches[0]?.id || '');
  const [addSuccess, setAddSuccess] = useState(false);

  // Filter slots based on user role and selections
  let relevantSlots: TimetableSlot[] = [];

  if (mode === 'teacher') {
    // Show slots for batches taught by this teacher
    const myBatchIds = teacherBatches.map((b) => b.id);
    relevantSlots = timetableSlots.filter((s) => myBatchIds.includes(s.batchId));
    if (selectedBatchId !== 'all') {
      relevantSlots = relevantSlots.filter((s) => s.batchId === selectedBatchId);
    }
  } else {
    // Show slots for batches the student is enrolled in
    relevantSlots = timetableSlots.filter((s) => studentBatchIds.includes(s.batchId));
  }

  // Filter by selected day if not 'all'
  if (selectedDayFilter !== 'all') {
    relevantSlots = relevantSlots.filter((s) => s.day === selectedDayFilter);
  }

  // Slots happening today for quick hero highlight
  const todaySlots = (mode === 'teacher'
    ? timetableSlots.filter((s) => teacherBatches.some((b) => b.id === s.batchId))
    : timetableSlots.filter((s) => studentBatchIds.includes(s.batchId))
  ).filter((s) => s.day === todayName);

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find((b) => b.id === targetBatchId);
    if (!batch) return;

    addTimetableSlot({
      batchId: batch.id,
      batchName: batch.name,
      grade: batch.grade,
      day: slotDay,
      startTime: slotStartTime.trim(),
      endTime: slotEndTime.trim(),
      subject: slotSubject.trim(),
      topic: slotTopic.trim() || undefined,
      room: slotRoom.trim() || 'Room 101',
      isSpecialSession: slotIsSpecial,
    });

    setAddSuccess(true);
    setTimeout(() => {
      setAddSuccess(false);
      setShowAddModal(false);
      setSlotTopic('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'teacher' ? 'Batch Timetable & Schedule Manager' : 'Weekly Class Timetable'}
            </h2>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full">
              {mode === 'teacher' ? 'Faculty Planner' : 'Student Schedule'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'teacher'
              ? 'Define recurring weekly class sessions, lab demonstrations, and weekend doubt clearing sessions for your batches.'
              : 'Your personalized weekly coaching timetable across all your enrolled classes and mentors.'}
          </p>
        </div>

        {mode === 'teacher' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Class Session
          </button>
        )}
      </div>

      {/* Today's Schedule Live Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-indigo-900/50">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Happening Today ({todayName})
            </h3>
          </div>
          <span className="text-[11px] text-slate-300">
            {todaySlots.length} session{todaySlots.length === 1 ? '' : 's'} scheduled
          </span>
        </div>

        {todaySlots.length === 0 ? (
          <p className="text-xs text-slate-300 italic">
            No live coaching sessions scheduled for today. Use this time for self-study and homework completion.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todaySlots.map((slot) => (
              <div
                key={slot.id}
                className="p-3.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl backdrop-blur-xs transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/40 text-indigo-100 border border-indigo-400/30">
                    {slot.subject}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-200 font-mono">
                    <Clock className="w-3 h-3 text-indigo-300" />
                    <span>{slot.startTime} – {slot.endTime}</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-white line-clamp-1">{slot.batchName}</p>
                {slot.topic && (
                  <p className="text-[11px] text-slate-300 line-clamp-1">Topic: {slot.topic}</p>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-white/10">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-300" />
                    {slot.room || 'Classroom'}
                  </span>
                  <span>{slot.teacherName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bar (Day Tabs & Batch Filter) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Day Selector Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              selectedDayFilter === 'all'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Week
          </button>
          {DAYS_OF_WEEK.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDayFilter(d)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedDayFilter === d
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d.slice(0, 3)}
              {d === todayName && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-1" />
              )}
            </button>
          ))}
        </div>

        {/* Batch Filter dropdown for Teacher mode */}
        {mode === 'teacher' && (
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500">Filter Batch:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50"
            >
              <option value="all">All My Batches ({teacherBatches.length})</option>
              {teacherBatches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Timetable Grid View */}
      {selectedDayFilter === 'all' ? (
        /* Full Week View (Grouped by Day) */
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const daySlots = relevantSlots.filter((s) => s.day === day);
            const isToday = day === todayName;

            return (
              <div
                key={day}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                  isToday ? 'border-indigo-300 ring-1 ring-indigo-200 bg-indigo-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">{day}</h3>
                    {isToday && (
                      <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {daySlots.length} class{daySlots.length === 1 ? '' : 'es'}
                  </span>
                </div>

                {daySlots.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No classes scheduled for {day}.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                          slot.isSpecialSession
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-100">
                              {slot.subject} · {slot.grade}
                            </span>
                            {slot.isSpecialSession && (
                              <span className="text-[9px] font-extrabold uppercase bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                                Special Session
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{slot.batchName}</h4>

                          <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-mono font-bold">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{slot.startTime} – {slot.endTime}</span>
                          </div>

                          {slot.topic && (
                            <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100 line-clamp-2">
                              {slot.topic}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {slot.room || 'Room 101'}
                          </span>

                          <div className="flex items-center gap-2">
                            <span>{slot.teacherName}</span>
                            {mode === 'teacher' && (
                              <button
                                onClick={() => deleteTimetableSlot(slot.id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                                title="Delete Schedule Slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Single Day Selected View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Classes for {selectedDayFilter}
            </h3>
            <span className="text-xs text-slate-400">
              {relevantSlots.length} session{relevantSlots.length === 1 ? '' : 's'}
            </span>
          </div>

          {relevantSlots.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No classes scheduled for {selectedDayFilter}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-100">
                        {slot.subject} · {slot.grade}
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{slot.batchName}</h4>
                    {slot.topic && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                        {slot.topic}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {slot.room || 'Room 101'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{slot.teacherName}</span>
                      {mode === 'teacher' && (
                        <button
                          onClick={() => deleteTimetableSlot(slot.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD SCHEDULE MODAL (FOR TEACHERS) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Add Class Session to Timetable</h3>
                <p className="text-xs text-slate-300">Set weekly time slot, topic, and room venue</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {addSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Session Added to Timetable!</h4>
                <p className="text-xs text-slate-500">Enrolled students will see this in their weekly dashboard.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateSlot} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Batch *</label>
                  <select
                    value={targetBatchId}
                    onChange={(e) => {
                      setTargetBatchId(e.target.value);
                      const b = batches.find((item) => item.id === e.target.value);
                      if (b) setSlotSubject(b.subject);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    {teacherBatches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Day of the Week *</label>
                    <select
                      value={slotDay}
                      onChange={(e) => setSlotDay(e.target.value as DayOfWeek)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={slotSubject}
                      onChange={(e) => setSlotSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 05:00 PM"
                      value={slotStartTime}
                      onChange={(e) => setSlotStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 06:30 PM"
                      value={slotEndTime}
                      onChange={(e) => setSlotEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Classroom / Lab Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 101 - Smart Board or Lab Wing"
                    value={slotRoom}
                    onChange={(e) => setSlotRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Topic / Focus Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Quadratic Formula Derivations & Speed Drills"
                    value={slotTopic}
                    onChange={(e) => setSlotTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="specialCheck"
                    checked={slotIsSpecial}
                    onChange={(e) => setSlotIsSpecial(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                  <label htmlFor="specialCheck" className="text-xs font-semibold text-slate-700">
                    Mark as Special Session (e.g. Weekend Doubt Clearing / Mock Test)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Save Slot to Timetable
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
