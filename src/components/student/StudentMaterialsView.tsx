import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  Download, 
  Search, 
  FileText, 
  Video, 
  ExternalLink 
} from 'lucide-react';

export const StudentMaterialsView: React.FC = () => {
  const { currentUser, studyMaterials, enrollments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  if (!currentUser) return null;

  // Active batches enrolled in
  const myEnrollments = enrollments.filter((e) => e.studentId === currentUser.id && e.status === 'active');
  const myBatchIds = myEnrollments.map((e) => e.batchId);

  // Materials for those batches
  const myMaterials = studyMaterials.filter((m) => myBatchIds.includes(m.batchId));

  const subjects = Array.from(new Set(myMaterials.map((m) => m.subject)));

  const filtered = myMaterials.filter((m) => {
    if (selectedSubject !== 'all' && m.subject !== selectedSubject) return false;
    if (
      searchTerm &&
      !m.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !m.chapter?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Study Materials & Formula Sheets
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access chapter notes, mind maps, formula guides, and video lectures uploaded directly by your teachers.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search notes, chapters, topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-400">
          No study materials found for your enrolled classes.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
                    {mat.subject} · {mat.grade}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {mat.fileSize || 'PDF'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{mat.title}</h3>
                {mat.chapter && (
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">
                    {mat.chapter}
                  </p>
                )}
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {mat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  By: <strong className="text-slate-800">{mat.teacherName}</strong>
                </span>

                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Note
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
