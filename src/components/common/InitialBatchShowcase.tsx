import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Batch, GradeLevel } from '../../types';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  Users, 
  Award,
  Sparkles,
  MapPin,
  KeyRound,
  FileCheck,
  X
} from 'lucide-react';

interface InitialBatchShowcaseProps {
  onSelectBatchForStudent: (batch: Batch) => void;
  onOpenTeacherAuth: () => void;
  onOpenStudentAuth: (batchId?: string) => void;
  onOpenOmshankarProfile: () => void;
  onOpenInstallModal: () => void;
}

const GRADE_FILTER_TABS: (GradeLevel | 'all')[] = [
  'all',
  'Class 10',
  'Class 12',
  'Class 9',
  'Class 8',
  'Class 7',
  'Class 6',
  'Class 5',
];

export const InitialBatchShowcase: React.FC<InitialBatchShowcaseProps> = ({
  onSelectBatchForStudent,
  onOpenTeacherAuth,
  onOpenStudentAuth,
  onOpenOmshankarProfile,
}) => {
  const { batches, appLogo } = useApp();
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [focusedBatch, setFocusedBatch] = useState<Batch | null>(null);

  const activeBatches = batches.filter((b) => b.active);
  const filteredBatches = selectedGrade === 'all' 
    ? activeBatches 
    : activeBatches.filter((b) => b.grade === selectedGrade);

  return (
    <div className="space-y-8 py-3 animate-fadeIn">
      {/* Top Banner: Academic Slate & Royal Sapphire Palette */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-blue-300" />
            <span>Coaching Management & Faculty Portal · Session 2026–2027</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-amber-200">
              {appLogo.instituteName} {appLogo.highlightWord}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Official coaching platform for Grades 5–12. Teachers configure curriculum batches with 
            <strong className="text-white"> Class levels</strong>, <strong className="text-white">Subjects</strong>, and <strong className="text-white">Joining Months</strong>, and provision student accounts. Students log in with teacher-assigned credentials or request batch admission.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenTeacherAuth}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-blue-200" />
              Teacher / Faculty Portal
            </button>

            <button
              onClick={() => onOpenStudentAuth()}
              className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl border border-slate-700 transition-all active:scale-95"
            >
              <User className="w-4 h-4 text-sky-400" />
              Student Sign In (Teacher Created)
            </button>

            <button
              onClick={onOpenOmshankarProfile}
              className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 transition-all active:scale-95"
            >
              <Award className="w-4 h-4 text-amber-400" />
              Omshankar (Founder)
            </button>
          </div>
        </div>
      </div>

      {/* Two-step Process Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Teacher Creates Batches & Student Accounts
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Faculty members register first to setup their class curriculum. Teachers specify the <strong>Class</strong>, <strong>Subject/Subjects</strong>, and <strong>Joining Batch Month</strong>, and create student accounts with login IDs and passwords.
            </p>
          </div>
          <div>
            <button
              onClick={onOpenTeacherAuth}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Faculty Login & Batch Management →
            </button>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Students Access Enrolled Batches
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Students access the app through their teacher-provided Student ID or Email. Review the active batches below to see class details, subjects covered, and scheduled joining months.
            </p>
          </div>
          <div>
            <button
              onClick={() => onOpenStudentAuth()}
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
            >
              <User className="w-4 h-4" />
              Student Portal & Account Access →
            </button>
          </div>
        </div>
      </div>

      {/* CORE REQUIREMENT: SHOW THE BATCHES USER WANTS TO USE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Active Batches · Created by Teachers
              </h2>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                {filteredBatches.length} Available
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the batch you want to use. Details show Class level, Subjects covered, and Joining Batch Month.
            </p>
          </div>

          {/* Grade filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {GRADE_FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedGrade(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  selectedGrade === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab === 'all' ? 'All Classes' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Batches Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBatches.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-xs text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No batches currently listed for this class level.</p>
              <p>Teachers can create new batches at any time from the Faculty Portal.</p>
            </div>
          ) : (
            filteredBatches.map((batch) => {
              const displaySubjects = batch.subjectsList && batch.subjectsList.length > 0
                ? batch.subjectsList.join(' · ')
                : batch.subject;

              const joiningMonthText = batch.joiningMonth || 'October 2026';

              return (
                <div
                  key={batch.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5 space-y-3.5">
                    {/* Header: Class & Joining Batch Month */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg">
                        {batch.grade}
                      </span>
                      {/* JOINING BATCH MONTH BADGE */}
                      <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        Joining: {joiningMonthText}
                      </span>
                    </div>

                    {/* Batch Name */}
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        {batch.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {batch.description}
                      </p>
                    </div>

                    {/* Class - Subjects Detail */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-800">
                        <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          Subjects: <strong className="text-slate-900">{displaySubjects}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{batch.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Teacher: <strong className="text-slate-800">{batch.teacherName}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Fee and Select Action */}
                  <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Teacher Fee</span>
                      <p className="text-base font-black text-blue-700">₹{batch.monthlyFee.toLocaleString()}<span className="text-xs font-normal text-slate-500">/mo</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFocusedBatch(batch)}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onSelectBatchForStudent(batch)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <span>Register Batch</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Focused Batch Inspection Modal */}
      {focusedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Batch Information
                </span>
                <h3 className="text-base font-black text-white">{focusedBatch.name}</h3>
              </div>
              <button
                onClick={() => setFocusedBatch(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-700 block uppercase">Class / Grade</span>
                  <span className="text-sm font-black text-blue-900">{focusedBatch.grade}</span>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-300">
                  <span className="text-[10px] font-bold text-amber-800 block uppercase">Joining Batch Month</span>
                  <span className="text-sm font-black text-amber-900">{focusedBatch.joiningMonth || 'October 2026'}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Subjects Covered</span>
                  <p className="text-sm font-black text-slate-900">
                    {focusedBatch.subjectsList?.join(' · ') || focusedBatch.subject}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600">Instructor: <strong>{focusedBatch.teacherName}</strong></span>
                  <span className="text-slate-600">Code: <strong className="font-mono">{focusedBatch.code}</strong></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Weekly Schedule: <strong>{focusedBatch.schedule}</strong></span>
                  <span className="text-slate-900 font-bold">₹{focusedBatch.monthlyFee.toLocaleString()}/mo</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">
                {focusedBatch.description}
              </p>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    const b = focusedBatch;
                    setFocusedBatch(null);
                    onSelectBatchForStudent(b);
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all active:scale-95 text-center"
                >
                  Register for this Batch (₹{focusedBatch.monthlyFee.toLocaleString()}/mo · {focusedBatch.joiningMonth || 'October 2026'})
                </button>
                <button
                  onClick={() => {
                    setFocusedBatch(null);
                    onOpenTeacherAuth();
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Faculty Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
